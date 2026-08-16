import { Result } from '@dns-smart-factory/db';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class QualityService {
  constructor(private readonly prisma: PrismaService) {}

  public async traceOrder(orderNo: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNo },
      select: {
        id: true,
        orderNo: true,
        productName: true,
        modelName: true,
        quantity: true,
        status: true,
        orderDate: true,
        plannedStartAt: true,
        dueDate: true,
        completedAt: true,
        customer: {
          select: {
            code: true,
            name: true,
          },
        },
        bomItems: {
          select: {
            id: true,
            quantityPerUnit: true,
            scrapRate: true,
            material: {
              select: {
                code: true,
                name: true,
                unit: true,
              },
            },
          },
        },
        units: {
          orderBy: {
            unitNumber: 'asc',
          },
          select: {
            id: true,
            serialNo: true,
            unitNumber: true,
            status: true,
            startedAt: true,
            completedAt: true,
            processRecords: {
              select: {
                id: true,
                status: true,
                equipmentCode: true,
                operatorName: true,
                plannedStart: true,
                startedAt: true,
                completedAt: true,
                goodQty: true,
                defectQty: true,
                reworkCount: true,
                notes: true,
                processStep: {
                  select: {
                    code: true,
                    name: true,
                    sequence: true,
                    standardHours: true,
                  },
                },
                materialUsage: {
                  orderBy: {
                    consumedAt: 'asc',
                  },
                  select: {
                    id: true,
                    quantity: true,
                    consumedAt: true,
                    operatorName: true,
                    inventoryLot: {
                      select: {
                        lotNo: true,
                        supplierName: true,
                        material: {
                          select: {
                            code: true,
                            name: true,
                            unit: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            inspections: {
              orderBy: {
                inspectedAt: 'asc',
              },
              select: {
                id: true,
                processRecordId: true,
                inspectionType: true,
                result: true,
                cameraCode: true,
                defectType: true,
                defectLocation: true,
                confidence: true,
                imageUrl: true,
                inspectorName: true,
                inspectedAt: true,
                notes: true,
              },
            },
            testRecords: {
              orderBy: {
                testedAt: 'asc',
              },
              select: {
                id: true,
                processRecordId: true,
                testType: true,
                result: true,
                measuredValue: true,
                measurementUnit: true,
                lowerLimit: true,
                upperLimit: true,
                equipmentName: true,
                operatorName: true,
                certificateNo: true,
                testedAt: true,
                notes: true,
              },
            },
          },
        },
        events: {
          orderBy: {
            occurredAt: 'desc',
          },
          select: {
            id: true,
            unitId: true,
            type: true,
            severity: true,
            title: true,
            message: true,
            source: true,
            payload: true,
            occurredAt: true,
            acknowledgedAt: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderNo} not found`);
    }

    const allInspections = order.units.flatMap((unit) => unit.inspections);

    const allTests = order.units.flatMap((unit) => unit.testRecords);

    const failedInspections = allInspections.filter(
      (inspection) => inspection.result === Result.FAIL,
    ).length;

    const failedTests = allTests.filter(
      (test) => test.result === Result.FAIL,
    ).length;

    const reviewCount =
      allInspections.filter((inspection) => inspection.result === Result.REVIEW)
        .length +
      allTests.filter((test) => test.result === Result.REVIEW).length;

    const traceStatus =
      failedInspections + failedTests > 0
        ? 'FAIL'
        : reviewCount > 0
          ? 'REVIEW'
          : allInspections.length + allTests.length === 0
            ? 'PENDING'
            : 'PASS';

    return {
      order: {
        id: order.id,
        orderNo: order.orderNo,
        customer: order.customer,
        productName: order.productName,
        modelName: order.modelName,
        quantity: order.quantity,
        status: order.status,
        orderDate: order.orderDate,
        plannedStartAt: order.plannedStartAt,
        dueDate: order.dueDate,
        completedAt: order.completedAt,
      },

      qualitySummary: {
        traceStatus,
        inspections: {
          total: allInspections.length,
          passed: allInspections.filter(
            (inspection) => inspection.result === Result.PASS,
          ).length,
          failed: failedInspections,
          review: allInspections.filter(
            (inspection) => inspection.result === Result.REVIEW,
          ).length,
        },
        tests: {
          total: allTests.length,
          passed: allTests.filter((test) => test.result === Result.PASS).length,
          failed: failedTests,
          review: allTests.filter((test) => test.result === Result.REVIEW)
            .length,
        },
      },

      bom: order.bomItems.map((item) => ({
        id: item.id,
        material: item.material,
        quantityPerUnit: Number(item.quantityPerUnit),
        scrapRate: Number(item.scrapRate),
      })),

      units: order.units.map((unit) => ({
        id: unit.id,
        serialNo: unit.serialNo,
        unitNumber: unit.unitNumber,
        status: unit.status,
        startedAt: unit.startedAt,
        completedAt: unit.completedAt,

        processes: [...unit.processRecords]
          .sort(
            (first, second) =>
              first.processStep.sequence - second.processStep.sequence,
          )
          .map((process) => ({
            id: process.id,
            step: {
              ...process.processStep,
              standardHours: Number(process.processStep.standardHours),
            },
            status: process.status,
            equipmentCode: process.equipmentCode,
            operatorName: process.operatorName,
            plannedStart: process.plannedStart,
            startedAt: process.startedAt,
            completedAt: process.completedAt,
            goodQty: process.goodQty,
            defectQty: process.defectQty,
            reworkCount: process.reworkCount,
            notes: process.notes,

            materialUsage: process.materialUsage.map((usage) => ({
              id: usage.id,
              material: usage.inventoryLot.material,
              lotNo: usage.inventoryLot.lotNo,
              supplierName: usage.inventoryLot.supplierName,
              quantity: Number(usage.quantity),
              consumedAt: usage.consumedAt,
              operatorName: usage.operatorName,
            })),

            inspections: unit.inspections
              .filter((inspection) => inspection.processRecordId === process.id)
              .map((inspection) => ({
                ...inspection,
                confidence:
                  inspection.confidence === null
                    ? null
                    : Number(inspection.confidence),
              })),

            tests: unit.testRecords
              .filter((test) => test.processRecordId === process.id)
              .map((test) => ({
                ...test,
                measuredValue:
                  test.measuredValue === null
                    ? null
                    : Number(test.measuredValue),
                lowerLimit:
                  test.lowerLimit === null ? null : Number(test.lowerLimit),
                upperLimit:
                  test.upperLimit === null ? null : Number(test.upperLimit),
              })),
          })),

        unlinkedInspections: unit.inspections.filter(
          (inspection) => inspection.processRecordId === null,
        ),

        unlinkedTests: unit.testRecords.filter(
          (test) => test.processRecordId === null,
        ),
      })),

      events: order.events,
      generatedAt: new Date().toISOString(),
    };
  }
}
