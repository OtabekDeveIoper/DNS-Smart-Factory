-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLANNED', 'IN_PRODUCTION', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'INSPECTION', 'TESTING', 'BLOCKED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REWORK', 'BLOCKED');

-- CreateEnum
CREATE TYPE "Result" AS ENUM ('PASS', 'FAIL', 'REVIEW');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MaterialUnit" AS ENUM ('EA', 'M', 'KG', 'M2', 'SET');

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "orderId" UUID,
    "unitId" UUID,
    "type" TEXT NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "message" TEXT,
    "source" TEXT NOT NULL DEFAULT 'SYSTEM',
    "payload" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specification" TEXT,
    "category" TEXT NOT NULL,
    "unit" "MaterialUnit" NOT NULL,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 0,
    "safetyStock" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BomItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "materialId" UUID NOT NULL,
    "quantityPerUnit" DECIMAL(14,3) NOT NULL,
    "scrapRate" DECIMAL(5,2) NOT NULL DEFAULT 0,

    CONSTRAINT "BomItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryLot" (
    "id" UUID NOT NULL,
    "materialId" UUID NOT NULL,
    "lotNo" TEXT NOT NULL,
    "supplierName" TEXT,
    "receivedQuantity" DECIMAL(14,3) NOT NULL,
    "currentQuantity" DECIMAL(14,3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialUsage" (
    "id" UUID NOT NULL,
    "inventoryLotId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "unitId" UUID,
    "processRecordId" UUID,
    "quantity" DECIMAL(14,3) NOT NULL,
    "consumedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operatorName" TEXT,
    "notes" TEXT,

    CONSTRAINT "MaterialUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessStep" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "standardHours" DECIMAL(8,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProcessStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessRecord" (
    "id" UUID NOT NULL,
    "unitId" UUID NOT NULL,
    "processStepId" UUID NOT NULL,
    "status" "ProcessStatus" NOT NULL DEFAULT 'PENDING',
    "equipmentCode" TEXT,
    "plannedStart" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "operatorName" TEXT,
    "goodQty" INTEGER NOT NULL DEFAULT 0,
    "defectQty" INTEGER NOT NULL DEFAULT 0,
    "reworkCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" UUID NOT NULL,
    "unitId" UUID NOT NULL,
    "processRecordId" UUID,
    "inspectionType" TEXT NOT NULL,
    "result" "Result" NOT NULL,
    "cameraCode" TEXT,
    "defectType" TEXT,
    "defectLocation" TEXT,
    "confidence" DECIMAL(5,2),
    "imageUrl" TEXT,
    "inspectorName" TEXT,
    "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestRecord" (
    "id" UUID NOT NULL,
    "unitId" UUID NOT NULL,
    "processRecordId" UUID,
    "testType" TEXT NOT NULL,
    "result" "Result" NOT NULL,
    "measuredValue" DECIMAL(14,3),
    "measurementUnit" TEXT,
    "lowerLimit" DECIMAL(14,3),
    "upperLimit" DECIMAL(14,3),
    "equipmentName" TEXT,
    "operatorName" TEXT,
    "certificateNo" TEXT,
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "TestRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "orderNo" TEXT NOT NULL,
    "customerId" UUID NOT NULL,
    "productName" TEXT NOT NULL,
    "modelName" TEXT,
    "quantity" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLANNED',
    "orderDate" DATE NOT NULL,
    "plannedStartAt" TIMESTAMP(3),
    "dueDate" DATE NOT NULL,
    "completedAt" TIMESTAMP(3),
    "bufferDays" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "serialNo" TEXT NOT NULL,
    "unitNumber" INTEGER NOT NULL,
    "status" "UnitStatus" NOT NULL DEFAULT 'WAITING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_severity_occurredAt_idx" ON "Event"("severity", "occurredAt");

-- CreateIndex
CREATE INDEX "Event_orderId_occurredAt_idx" ON "Event"("orderId", "occurredAt");

-- CreateIndex
CREATE INDEX "Event_unitId_occurredAt_idx" ON "Event"("unitId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "Material_code_key" ON "Material"("code");

-- CreateIndex
CREATE INDEX "BomItem_materialId_idx" ON "BomItem"("materialId");

-- CreateIndex
CREATE UNIQUE INDEX "BomItem_orderId_materialId_key" ON "BomItem"("orderId", "materialId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryLot_lotNo_key" ON "InventoryLot"("lotNo");

-- CreateIndex
CREATE INDEX "InventoryLot_materialId_currentQuantity_idx" ON "InventoryLot"("materialId", "currentQuantity");

-- CreateIndex
CREATE INDEX "MaterialUsage_inventoryLotId_consumedAt_idx" ON "MaterialUsage"("inventoryLotId", "consumedAt");

-- CreateIndex
CREATE INDEX "MaterialUsage_orderId_idx" ON "MaterialUsage"("orderId");

-- CreateIndex
CREATE INDEX "MaterialUsage_unitId_idx" ON "MaterialUsage"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessStep_code_key" ON "ProcessStep"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessStep_sequence_key" ON "ProcessStep"("sequence");

-- CreateIndex
CREATE INDEX "ProcessRecord_status_startedAt_idx" ON "ProcessRecord"("status", "startedAt");

-- CreateIndex
CREATE INDEX "ProcessRecord_processStepId_completedAt_idx" ON "ProcessRecord"("processStepId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessRecord_unitId_processStepId_key" ON "ProcessRecord"("unitId", "processStepId");

-- CreateIndex
CREATE INDEX "Inspection_unitId_inspectedAt_idx" ON "Inspection"("unitId", "inspectedAt");

-- CreateIndex
CREATE INDEX "Inspection_result_inspectedAt_idx" ON "Inspection"("result", "inspectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TestRecord_certificateNo_key" ON "TestRecord"("certificateNo");

-- CreateIndex
CREATE INDEX "TestRecord_unitId_testedAt_idx" ON "TestRecord"("unitId", "testedAt");

-- CreateIndex
CREATE INDEX "TestRecord_result_testedAt_idx" ON "TestRecord"("result", "testedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_code_key" ON "Customer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNo_key" ON "Order"("orderNo");

-- CreateIndex
CREATE INDEX "Order_status_dueDate_idx" ON "Order"("status", "dueDate");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_serialNo_key" ON "Unit"("serialNo");

-- CreateIndex
CREATE INDEX "Unit_orderId_status_idx" ON "Unit"("orderId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_orderId_unitNumber_key" ON "Unit"("orderId", "unitNumber");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BomItem" ADD CONSTRAINT "BomItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BomItem" ADD CONSTRAINT "BomItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialUsage" ADD CONSTRAINT "MaterialUsage_inventoryLotId_fkey" FOREIGN KEY ("inventoryLotId") REFERENCES "InventoryLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialUsage" ADD CONSTRAINT "MaterialUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialUsage" ADD CONSTRAINT "MaterialUsage_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialUsage" ADD CONSTRAINT "MaterialUsage_processRecordId_fkey" FOREIGN KEY ("processRecordId") REFERENCES "ProcessRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessRecord" ADD CONSTRAINT "ProcessRecord_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessRecord" ADD CONSTRAINT "ProcessRecord_processStepId_fkey" FOREIGN KEY ("processStepId") REFERENCES "ProcessStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_processRecordId_fkey" FOREIGN KEY ("processRecordId") REFERENCES "ProcessRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestRecord" ADD CONSTRAINT "TestRecord_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestRecord" ADD CONSTRAINT "TestRecord_processRecordId_fkey" FOREIGN KEY ("processRecordId") REFERENCES "ProcessRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
