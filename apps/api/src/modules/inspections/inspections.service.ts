import { ProcessStatus } from '@dns-smart-factory/db';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class InspectionsService {
  constructor(private readonly prisma: PrismaService) {}

  public async findTargets() {
    const units = await this.prisma.unit.findMany({
      where: {
        processRecords: {
          some: {
            processStep: { code: 'WIRING' },
            status: {
              in: [
                ProcessStatus.IN_PROGRESS,
                ProcessStatus.COMPLETED,
                ProcessStatus.REWORK,
              ],
            },
          },
        },
      },
      select: {
        id: true,
        serialNo: true,
        unitNumber: true,
        status: true,
        order: {
          select: {
            orderNo: true,
            productName: true,
            modelName: true,
          },
        },
        processRecords: {
          where: {
            processStep: { code: 'WIRING' },
          },
          take: 1,
          select: {
            id: true,
            status: true,
            equipmentCode: true,
            operatorName: true,
            startedAt: true,
            completedAt: true,
          },
        },
        inspections: {
          where: {
            inspectionType: 'AI_WIRING',
          },
          orderBy: {
            inspectedAt: 'desc',
          },
          take: 1,
          select: {
            id: true,
            result: true,
            confidence: true,
            defectType: true,
            inspectedAt: true,
          },
        },
      },
      orderBy: {
        serialNo: 'asc',
      },
    });

    return units.map((unit) => {
      const wiringProcess = unit.processRecords[0] ?? null;
      const latestInspection = unit.inspections[0] ?? null;

      return {
        id: unit.id,
        serialNo: unit.serialNo,
        unitNumber: unit.unitNumber,
        unitStatus: unit.status,
        order: unit.order,
        wiringProcess,
        latestInspection: latestInspection
          ? {
              ...latestInspection,
              confidence:
                latestInspection.confidence === null
                  ? null
                  : Number(latestInspection.confidence),
            }
          : null,
      };
    });
  }

  public async findUnitHistory(serialNo: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { serialNo },
      select: {
        id: true,
        serialNo: true,
        unitNumber: true,
        status: true,
        order: {
          select: {
            orderNo: true,
            productName: true,
            modelName: true,
          },
        },
        inspections: {
          orderBy: {
            inspectedAt: 'desc',
          },
          select: {
            id: true,
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
            processRecord: {
              select: {
                id: true,
                status: true,
                processStep: {
                  select: {
                    code: true,
                    name: true,
                    sequence: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException(`Unit ${serialNo} not found`);
    }

    return {
      ...unit,
      inspections: unit.inspections.map((inspection) => ({
        ...inspection,
        confidence:
          inspection.confidence === null ? null : Number(inspection.confidence),
      })),
    };
  }
}
