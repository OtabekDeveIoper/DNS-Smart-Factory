import {
  ProcessStatus,
  Result,
  type PrismaClient,
} from "../../generated/prisma/client.cjs";

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export async function seedQuality(prisma: PrismaClient) {
  const units = await prisma.unit.findMany({
    include: {
      order: true,
      processRecords: {
        include: { processStep: true },
      },
    },
    orderBy: { serialNo: "asc" },
  });

  for (const unit of units) {
    const wiringRecord = unit.processRecords.find(
      (record) => record.processStep.code === "WIRING",
    );

    const testingRecord = unit.processRecords.find(
      (record) => record.processStep.code === "TESTING",
    );

    if (wiringRecord && wiringRecord.status !== ProcessStatus.PENDING) {
      const hasDefect =
        unit.order.orderNo === "DN-2607-014" && unit.unitNumber === 2;

      const inspectionData = {
        processRecordId: wiringRecord.id,
        inspectionType: "AI_WIRING",
        result: hasDefect ? Result.FAIL : Result.PASS,
        cameraCode: "CAM-01",
        defectType: hasDefect ? "POSSIBLE_MISWIRING" : null,
        defectLocation: hasDefect ? "Terminal block TB-12" : null,
        confidence: hasDefect ? 97.2 : 99.1,
        inspectorName: "AI Vision Mock v1",
        inspectedAt:
          wiringRecord.completedAt ??
          addHours(wiringRecord.startedAt ?? new Date(), 1),
        notes: hasDefect
          ? "Manual review required"
          : "No wiring defect detected",
      };

      const existingInspection = await prisma.inspection.findFirst({
        where: {
          unitId: unit.id,
          inspectionType: "AI_WIRING",
        },
      });

      if (existingInspection) {
        await prisma.inspection.update({
          where: { id: existingInspection.id },
          data: inspectionData,
        });
      } else {
        await prisma.inspection.create({
          data: {
            unitId: unit.id,
            ...inspectionData,
          },
        });
      }
    }

    if (testingRecord && testingRecord.status !== ProcessStatus.PENDING) {
      const hasSequenceFailure =
        unit.order.orderNo === "DN-2606-096" && unit.unitNumber === 2;

      const testedAt =
        testingRecord.completedAt ??
        addHours(testingRecord.startedAt ?? new Date(), 1);

      const tests = [
        {
          testType: "INSULATION_RESISTANCE",
          result: Result.PASS,
          measuredValue: 520,
          measurementUnit: "MOhm",
          lowerLimit: 100,
          upperLimit: null,
        },
        {
          testType: "AC_WITHSTAND",
          result: Result.PASS,
          measuredValue: 2.5,
          measurementUnit: "kV",
          lowerLimit: 2.5,
          upperLimit: null,
        },
        {
          testType: "SEQUENCE_OPERATION",
          result: hasSequenceFailure ? Result.FAIL : Result.PASS,
          measuredValue: null,
          measurementUnit: null,
          lowerLimit: null,
          upperLimit: null,
        },
      ];

      for (const test of tests) {
        const certificateNo = `${unit.serialNo}-${test.testType}`;

        await prisma.testRecord.upsert({
          where: { certificateNo },
          update: {
            ...test,
            processRecordId: testingRecord.id,
            testedAt,
          },
          create: {
            unitId: unit.id,
            processRecordId: testingRecord.id,
            certificateNo,
            equipmentName: "TEST-BENCH-01",
            operatorName: "Quality Operator",
            testedAt,
            ...test,
          },
        });
      }
    }
  }
}
