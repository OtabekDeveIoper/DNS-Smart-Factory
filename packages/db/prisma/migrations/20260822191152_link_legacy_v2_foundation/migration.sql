-- Expand legacy aggregate roots with nullable V2 ownership links.
-- Existing readers and writers remain compatible until backfill is verified.
BEGIN;

ALTER TABLE "Customer" ADD COLUMN "organizationId" UUID;
ALTER TABLE "Material" ADD COLUMN "organizationId" UUID;
ALTER TABLE "Order" ADD COLUMN "plantId" UUID;
ALTER TABLE "InventoryLot" ADD COLUMN "plantId" UUID;

CREATE INDEX "Customer_organizationId_idx" ON "Customer"("organizationId");
CREATE INDEX "Material_organizationId_idx" ON "Material"("organizationId");
CREATE INDEX "Order_plantId_idx" ON "Order"("plantId");
CREATE INDEX "InventoryLot_plantId_idx" ON "InventoryLot"("plantId");

ALTER TABLE "Customer"
ADD CONSTRAINT "Customer_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Material"
ADD CONSTRAINT "Material_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Order"
ADD CONSTRAINT "Order_plantId_fkey"
FOREIGN KEY ("plantId") REFERENCES "Plant"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InventoryLot"
ADD CONSTRAINT "InventoryLot_plantId_fkey"
FOREIGN KEY ("plantId") REFERENCES "Plant"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
