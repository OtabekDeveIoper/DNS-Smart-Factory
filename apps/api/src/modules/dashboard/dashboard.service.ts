import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  DashboardKpisResponse,
  UtilizationRow,
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
}
