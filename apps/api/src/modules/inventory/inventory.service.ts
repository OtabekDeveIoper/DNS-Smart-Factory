import { OrderStatus, UnitStatus } from '@dns-smart-factory/db';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { MILLISECONDS_PER_DAY, PLANNING_DAYS } from '../../libs/constants';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  public async getOverview() {
    const now = new Date();
    const horizonEnd = new Date(now);

    horizonEnd.setDate(horizonEnd.getDate() + PLANNING_DAYS);
    horizonEnd.setHours(23, 59, 59, 999);

    const materials = await this.prisma.material.findMany({
      include: {
        inventoryLots: {
          select: {
            id: true,
            lotNo: true,
            supplierName: true,
            currentQuantity: true,
            receivedAt: true,
            expiresAt: true,
          },
          orderBy: {
            receivedAt: 'asc',
          },
        },
        bomItems: {
          where: {
            order: {
              status: {
                in: [
                  OrderStatus.PLANNED,
                  OrderStatus.IN_PRODUCTION,
                  OrderStatus.ON_HOLD,
                ],
              },
              dueDate: {
                lte: horizonEnd,
              },
            },
          },
          include: {
            order: {
              select: {
                orderNo: true,
                status: true,
                plannedStartAt: true,
                dueDate: true,
                units: {
                  select: {
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        code: 'asc',
      },
    });

    const items = materials.map((material) => {
      const currentStock = material.inventoryLots.reduce(
        (total, lot) => total + Number(lot.currentQuantity),
        0,
      );

      const twoWeekDemand = material.bomItems.reduce((total, bomItem) => {
        const remainingUnits = bomItem.order.units.filter(
          (unit) => unit.status !== UnitStatus.COMPLETED,
        ).length;

        const quantityPerUnit = Number(bomItem.quantityPerUnit);
        const scrapMultiplier = 1 + Number(bomItem.scrapRate) / 100;

        return total + remainingUnits * quantityPerUnit * scrapMultiplier;
      }, 0);

      const safetyStock = Number(material.safetyStock);
      const requiredStock = twoWeekDemand + safetyStock;
      const projectedBalance = currentStock - twoWeekDemand;
      const shortageQuantity = Math.max(requiredStock - currentStock, 0);

      const status =
        shortageQuantity > 0
          ? 'SHORTAGE'
          : projectedBalance < safetyStock * 1.5
            ? 'LOW'
            : 'SUFFICIENT';

      const requiredDates = material.bomItems.map((item) =>
        (item.order.plannedStartAt ?? item.order.dueDate).getTime(),
      );

      const earliestRequiredAt =
        requiredDates.length === 0
          ? null
          : new Date(Math.min(...requiredDates));

      const purchaseByAt = earliestRequiredAt
        ? new Date(
            earliestRequiredAt.getTime() -
              material.leadTimeDays * MILLISECONDS_PER_DAY,
          )
        : null;

      return {
        id: material.id,
        code: material.code,
        name: material.name,
        category: material.category,
        unit: material.unit,
        leadTimeDays: material.leadTimeDays,
        currentStock: Number(currentStock.toFixed(3)),
        twoWeekDemand: Number(twoWeekDemand.toFixed(3)),
        safetyStock: Number(safetyStock.toFixed(3)),
        requiredStock: Number(requiredStock.toFixed(3)),
        projectedBalance: Number(projectedBalance.toFixed(3)),
        shortageQuantity: Number(shortageQuantity.toFixed(3)),
        suggestedPurchaseQuantity: Number(shortageQuantity.toFixed(3)),
        status,
        earliestRequiredAt,
        purchaseByAt,
        affectedOrders: material.bomItems.map((item) => ({
          orderNo: item.order.orderNo,
          status: item.order.status,
          dueDate: item.order.dueDate,
        })),
        lots: material.inventoryLots.map((lot) => ({
          ...lot,
          currentQuantity: Number(lot.currentQuantity),
        })),
      };
    });

    return {
      planningDays: PLANNING_DAYS,
      summary: {
        totalMaterials: items.length,
        shortageMaterials: items.filter((item) => item.status === 'SHORTAGE')
          .length,
        lowStockMaterials: items.filter((item) => item.status === 'LOW').length,
      },
      items,
      generatedAt: now.toISOString(),
    };
  }
}
