import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  DashboardKpisResponse,
  ProcessLineItem,
  UtilizationRow,
  WeeklyPerformancePoint,
  WeeklyPerformanceRow,
} from '../../libs/types/dashboard';
import { OrderStatus, ProcessStatus, UnitStatus } from '@dns-smart-factory/db';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  public async getKpis(): Promise<DashboardKpisResponse> {
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      todayOutput,
      activeUnits,
      reworkAggregate,
      completedOrders,
      utilizationRows,
    ] = await Promise.all([
      this.prisma.processRecord.count({
        where: {
          status: ProcessStatus.COMPLETED,
          completedAt: {
            gte: todayStart,
            lt: tomorrowStart,
          },
        },
      }),

      this.prisma.unit.count({
        where: {
          status: {
            in: [
              UnitStatus.IN_PROGRESS,
              UnitStatus.INSPECTION,
              UnitStatus.TESTING,
              UnitStatus.BLOCKED,
            ],
          },
        },
      }),

      this.prisma.processRecord.aggregate({
        where: {
          reworkCount: { gt: 0 },
          updatedAt: { gte: sevenDaysAgo },
        },
        _sum: {
          reworkCount: true,
        },
      }),

      this.prisma.order.findMany({
        where: {
          status: OrderStatus.COMPLETED,
          completedAt: { not: null },
        },
        select: {
          dueDate: true,
          completedAt: true,
        },
      }),

      this.prisma.$queryRaw<UtilizationRow[]>`
        WITH equipment_load AS (
            SELECT
            "equipmentCode",
            LEAST(
                SUM(
                EXTRACT(EPOCH FROM ("completedAt" - "startedAt")) / 60
                ),
                480.0 * 7
            ) AS "busyMinutes"
            FROM "ProcessRecord"
            WHERE "startedAt" >= ${sevenDaysAgo}
            AND "completedAt" IS NOT NULL
            AND "equipmentCode" IS NOT NULL
            GROUP BY "equipmentCode"
        )
        SELECT
            COALESCE(
            SUM("busyMinutes") /
            NULLIF(COUNT(*) * 480.0 * 7, 0) * 100,
            0
            )::double precision AS "utilization"
        FROM equipment_load
        `,
    ]);

    const onTimeOrders = completedOrders.filter((order) => {
      if (!order.completedAt) return false;

      const endOfDueDate = new Date(order.dueDate);
      endOfDueDate.setDate(endOfDueDate.getDate() + 1);

      return order.completedAt < endOfDueDate;
    }).length;

    const onTimeDeliveryRate =
      completedOrders.length === 0
        ? 0
        : (onTimeOrders / completedOrders.length) * 100;

    return {
      todayOutput,
      activeUnits,
      onTimeDeliveryRate: Number(onTimeDeliveryRate.toFixed(1)),
      weeklyRework: reworkAggregate._sum.reworkCount ?? 0,
      equipmentUtilization: Number(
        Number(utilizationRows[0]?.utilization ?? 0).toFixed(1),
      ),
      generatedAt: now.toISOString(),
    };
  }

  async getProcessLine(): Promise<ProcessLineItem[]> {
    const [steps, groups] = await Promise.all([
      this.prisma.processStep.findMany({
        where: { isActive: true },
        orderBy: { sequence: 'asc' },
      }),
      this.prisma.processRecord.groupBy({
        by: ['processStepId', 'status'],
        _count: { _all: true },
      }),
    ]);

    return steps.map((step) => {
      const stepGroups = groups.filter(
        (group) => group.processStepId === step.id,
      );

      const countStatus = (status: ProcessStatus) =>
        stepGroups.find((group) => group.status === status)?._count._all ?? 0;

      const completed = countStatus(ProcessStatus.COMPLETED);
      const inProgress = countStatus(ProcessStatus.IN_PROGRESS);
      const blocked = countStatus(ProcessStatus.BLOCKED);

      const total = stepGroups.reduce(
        (sum, group) => sum + group._count._all,
        0,
      );
      const status =
        blocked > 0 ? 'BLOCKED' : inProgress > 0 ? 'RUNNING' : 'IDLE';

      return {
        id: step.id,
        code: step.code,
        name: step.name,
        sequence: step.sequence,
        status,
        completed,
        inProgress,
        blocked,
        total,
        completionRate:
          total === 0 ? 0 : Number(((completed / total) * 100).toFixed(1)),
      };
    });
  }

  async getWeeklyPerformance(): Promise<WeeklyPerformancePoint[]> {
    const rows = await this.prisma.$queryRaw<WeeklyPerformanceRow[]>`
    WITH days AS (
      SELECT generate_series(
        (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date - 6,
        (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date,
        INTERVAL '1 day'
      )::date AS day
    ),
    performance AS (
      SELECT
        (
          "completedAt" AT TIME ZONE 'UTC'
          AT TIME ZONE 'Asia/Seoul'
        )::date AS day,
        COUNT(*) AS "completed",
        SUM("defectQty") AS "defects",
        SUM("reworkCount") AS "reworks"
      FROM "ProcessRecord"
      WHERE "completedAt" IS NOT NULL
        AND (
          "completedAt" AT TIME ZONE 'UTC'
          AT TIME ZONE 'Asia/Seoul'
        )::date >=
          (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date - 6
      GROUP BY day
    )
    SELECT
      TO_CHAR(days.day, 'YYYY-MM-DD') AS "date",
      COALESCE(performance."completed", 0)::bigint AS "completed",
      COALESCE(performance."defects", 0)::bigint AS "defects",
      COALESCE(performance."reworks", 0)::bigint AS "reworks"
    FROM days
    LEFT JOIN performance ON performance.day = days.day
    ORDER BY days.day
  `;

    return rows.map((row) => ({
      date: row.date,
      completed: Number(row.completed),
      defects: Number(row.defects),
      reworks: Number(row.reworks),
    }));
  }

  async getRecentAlerts() {
    return this.prisma.event.findMany({
      take: 8,
      orderBy: { occurredAt: 'desc' },
      select: {
        id: true,
        type: true,
        severity: true,
        title: true,
        message: true,
        source: true,
        occurredAt: true,
        acknowledgedAt: true,
        order: {
          select: {
            orderNo: true,
          },
        },
        unit: {
          select: {
            serialNo: true,
          },
        },
      },
    });
  }

  async getOverview() {
    const [kpis, processLine, weeklyPerformance, recentAlerts] =
      await Promise.all([
        this.getKpis(),
        this.getProcessLine(),
        this.getWeeklyPerformance(),
        this.getRecentAlerts(),
      ]);

    return {
      kpis,
      processLine,
      weeklyPerformance,
      recentAlerts,
    };
  }
}
