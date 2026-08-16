import {
  OrderStatus,
  ProcessStatus,
  UnitStatus,
  type Prisma,
} from '@dns-smart-factory/db';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { HOURS_PER_WORKDAY, MILLISECONDS_PER_DAY } from 'src/libs/constants';
import { DeliveryRisk, DeliveryRiskLevel } from 'src/libs/types/order';

const orderInclude = {
  customer: true,
  units: {
    include: {
      processRecords: {
        include: {
          processStep: true,
        },
      },
    },
  },
} satisfies Prisma.OrderInclude;

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

type UnitWithProcesses = OrderWithDetails['units'][number];

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  public async findAll() {
    const orders = await this.prisma.order.findMany({
      include: orderInclude,
      orderBy: {
        dueDate: 'asc',
      },
    });

    return orders.map((order) => this.mapOrder(order, false));
  }

  async findByOrderNo(orderNo: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNo },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderNo} not found`);
    }

    return this.mapOrder(order, true);
  }

  private mapOrder(order: OrderWithDetails, includeProcesses: boolean) {
    const units = order.units
      .sort((a, b) => a.unitNumber - b.unitNumber)
      .map((unit) => this.summarizeUnit(unit, includeProcesses));

    const progressPercent =
      units.length === 0
        ? 0
        : units.reduce((sum, unit) => sum + unit.progressPercent, 0) /
          units.length;

    const activeStatuses = new Set<UnitStatus>([
      UnitStatus.IN_PROGRESS,
      UnitStatus.INSPECTION,
      UnitStatus.TESTING,
      UnitStatus.BLOCKED,
    ]);

    const activeUnits = units.filter((unit) =>
      activeStatuses.has(unit.status),
    ).length;

    const completedUnits = units.filter(
      (unit) => unit.status === 'COMPLETED',
    ).length;

    const deliveryRisk = this.calculateDeliveryRisk(order, units);

    return {
      id: order.id,
      orderNo: order.orderNo,
      customer: {
        code: order.customer.code,
        name: order.customer.name,
      },
      productName: order.productName,
      modelName: order.modelName,
      quantity: order.quantity,
      status: order.status,
      orderDate: order.orderDate,
      plannedStartAt: order.plannedStartAt,
      dueDate: order.dueDate,
      completedAt: order.completedAt,
      progressPercent: Number(progressPercent.toFixed(1)),
      completedUnits,
      activeUnits: activeUnits,
      deliveryRisk,
      units,
    };
  }

  private summarizeUnit(unit: UnitWithProcesses, includeProcesses: boolean) {
    const records = [...unit.processRecords].sort(
      (a, b) => a.processStep.sequence - b.processStep.sequence,
    );

    const totalStandardHours = records.reduce(
      (sum, record) => sum + Number(record.processStep.standardHours),
      0,
    );

    const completedStandardHours = records
      .filter((record) => record.status === ProcessStatus.COMPLETED)
      .reduce(
        (sum, record) => sum + Number(record.processStep.standardHours),
        0,
      );

    const remainingStandardHours = totalStandardHours - completedStandardHours;

    const currentRecord =
      records.find(
        (record) =>
          record.status === ProcessStatus.IN_PROGRESS ||
          record.status === ProcessStatus.BLOCKED,
      ) ?? records.find((record) => record.status === ProcessStatus.PENDING);

    const summary = {
      id: unit.id,
      serialNo: unit.serialNo,
      unitNumber: unit.unitNumber,
      status: unit.status,
      startedAt: unit.startedAt,
      completedAt: unit.completedAt,
      progressPercent:
        totalStandardHours === 0
          ? 0
          : Number(
              ((completedStandardHours / totalStandardHours) * 100).toFixed(1),
            ),
      remainingStandardHours: Number(remainingStandardHours.toFixed(1)),
      currentProcess: currentRecord
        ? {
            code: currentRecord.processStep.code,
            name: currentRecord.processStep.name,
            sequence: currentRecord.processStep.sequence,
            status: currentRecord.status,
          }
        : null,
    };

    if (!includeProcesses) {
      return summary;
    }

    return {
      ...summary,
      processes: records.map((record) => ({
        id: record.id,
        code: record.processStep.code,
        name: record.processStep.name,
        sequence: record.processStep.sequence,
        standardHours: Number(record.processStep.standardHours),
        status: record.status,
        equipmentCode: record.equipmentCode,
        operatorName: record.operatorName,
        plannedStart: record.plannedStart,
        startedAt: record.startedAt,
        completedAt: record.completedAt,
        defectQty: record.defectQty,
        reworkCount: record.reworkCount,
      })),
    };
  }

  private calculateDeliveryRisk(
    order: OrderWithDetails,
    units: Array<{
      remainingStandardHours: number;
    }>,
  ): DeliveryRisk {
    if (order.status === OrderStatus.COMPLETED) {
      return {
        level: 'COMPLETED',
        remainingStandardHours: 0,
        productionDays: 0,
        bufferDays: order.bufferDays,
        requiredDays: 0,
        availableDays: 0,
        marginDays: 0,
        projectedCompletionAt: order.completedAt?.toISOString() ?? null,
      };
    }

    const remainingStandardHours = Math.max(
      0,
      ...units.map((unit) => unit.remainingStandardHours),
    );

    const productionDays = remainingStandardHours / HOURS_PER_WORKDAY;

    const requiredDays = productionDays + order.bufferDays;

    const now = new Date();
    const dueDateEnd = new Date(order.dueDate);
    dueDateEnd.setHours(23, 59, 59, 999);

    const availableDays =
      (dueDateEnd.getTime() - now.getTime()) / MILLISECONDS_PER_DAY;

    const marginDays = availableDays - requiredDays;

    let level: DeliveryRiskLevel;

    if (availableDays < 0) {
      level = 'OVERDUE';
    } else if (marginDays < 0) {
      level = 'HIGH';
    } else if (marginDays <= 1) {
      level = 'MEDIUM';
    } else {
      level = 'ON_TRACK';
    }

    const projectedCompletionAt = new Date(
      now.getTime() + requiredDays * MILLISECONDS_PER_DAY,
    );

    return {
      level,
      remainingStandardHours: Number(remainingStandardHours.toFixed(1)),
      productionDays: Number(productionDays.toFixed(1)),
      bufferDays: order.bufferDays,
      requiredDays: Number(requiredDays.toFixed(1)),
      availableDays: Number(availableDays.toFixed(1)),
      marginDays: Number(marginDays.toFixed(1)),
      projectedCompletionAt: projectedCompletionAt.toISOString(),
    };
  }
}
