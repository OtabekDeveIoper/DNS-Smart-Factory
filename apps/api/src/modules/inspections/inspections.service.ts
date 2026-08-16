import { ProcessStatus, Result, Severity } from '@dns-smart-factory/db';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AnalyzeInspectionDto } from './dto/analyze-inspection.dto';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class InspectionsService {
  constructor(private readonly prisma: PrismaService) {}

  public async analyze(dto: AnalyzeInspectionDto) {
    const serialNo = dto.serialNo?.trim();

    if (!serialNo) {
      throw new BadRequestException('serialNo is required');
    }

    const unit = await this.prisma.unit.findUnique({
      where: { serialNo },
      select: {
        id: true,
        orderId: true,
        serialNo: true,
        status: true,
        order: {
          select: {
            orderNo: true,
            productName: true,
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
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException(`Unit ${serialNo} not found`);
    }

    const wiringProcess = unit.processRecords[0];

    if (!wiringProcess) {
      throw new NotFoundException(
        `WIRING process not found for unit ${serialNo}`,
      );
    }

    if (wiringProcess.status === ProcessStatus.PENDING) {
      throw new BadRequestException(`Unit ${serialNo} has not reached WIRING`);
    }

    const hasDefect = dto.simulateDefect === true;
    const result = hasDefect ? Result.FAIL : Result.PASS;
    const confidence = hasDefect ? 97.2 : 99.1;
    const cameraCode = dto.cameraCode?.trim() || 'CAM-01';

    return this.prisma.$transaction(async (tx) => {
      const inspection = await tx.inspection.create({
        data: {
          unitId: unit.id,
          processRecordId: wiringProcess.id,
          inspectionType: 'AI_WIRING',
          result,
          cameraCode,
          defectType: hasDefect ? 'POSSIBLE_MISWIRING' : null,
          defectLocation: hasDefect ? 'Terminal block TB-12' : null,
          confidence,
          imageUrl: dto.imageUrl,
          inspectorName: 'AI Vision Mock v1',
          notes: hasDefect
            ? 'Manual review required'
            : 'No wiring defect detected',
        },
      });

      const event = await tx.event.create({
        data: {
          orderId: unit.orderId,
          unitId: unit.id,
          type: hasDefect ? 'AI_WIRING_DEFECT' : 'AI_WIRING_INSPECTION',
          severity: hasDefect ? Severity.CRITICAL : Severity.INFO,
          title: hasDefect
            ? 'Possible wiring defect detected'
            : 'Wiring inspection passed',
          message: hasDefect
            ? 'Manual review required at terminal block TB-12.'
            : 'No wiring defect detected.',
          source: 'AI_VISION_MOCK',
          payload: {
            inspectionId: inspection.id,
            result,
            confidence,
            cameraCode,
          },
        },
      });

      return {
        unit: {
          serialNo: unit.serialNo,
          status: unit.status,
          order: unit.order,
        },
        inspection: {
          ...inspection,
          confidence:
            inspection.confidence === null
              ? null
              : Number(inspection.confidence),
        },
        event: {
          id: event.id,
          type: event.type,
          severity: event.severity,
          occurredAt: event.occurredAt,
        },
      };
    });
  }

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
