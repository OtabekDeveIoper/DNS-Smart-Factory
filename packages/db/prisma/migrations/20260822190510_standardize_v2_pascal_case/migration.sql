-- Preserve all V2 foundation data while aligning physical names with the
-- existing Prisma PascalCase table and camelCase column convention.
BEGIN;

-- Tables
ALTER TABLE "organizations" RENAME TO "Organization";
ALTER TABLE "plants" RENAME TO "Plant";
ALTER TABLE "areas" RENAME TO "Area";
ALTER TABLE "production_lines" RENAME TO "ProductionLine";
ALTER TABLE "work_centers" RENAME TO "WorkCenter";
ALTER TABLE "equipment" RENAME TO "Equipment";
ALTER TABLE "users" RENAME TO "User";
ALTER TABLE "roles" RENAME TO "Role";
ALTER TABLE "permissions" RENAME TO "Permission";
ALTER TABLE "role_permissions" RENAME TO "RolePermission";
ALTER TABLE "user_plant_roles" RENAME TO "UserPlantRole";
ALTER TABLE "user_system_roles" RENAME TO "UserSystemRole";

-- Organization columns
ALTER TABLE "Organization" RENAME COLUMN "is_active" TO "isActive";
ALTER TABLE "Organization" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "Organization" RENAME COLUMN "updated_at" TO "updatedAt";

-- Plant columns
ALTER TABLE "Plant" RENAME COLUMN "organization_id" TO "organizationId";
ALTER TABLE "Plant" RENAME COLUMN "is_active" TO "isActive";
ALTER TABLE "Plant" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "Plant" RENAME COLUMN "updated_at" TO "updatedAt";

-- Area columns
ALTER TABLE "Area" RENAME COLUMN "plant_id" TO "plantId";
ALTER TABLE "Area" RENAME COLUMN "is_active" TO "isActive";
ALTER TABLE "Area" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "Area" RENAME COLUMN "updated_at" TO "updatedAt";

-- ProductionLine columns
ALTER TABLE "ProductionLine" RENAME COLUMN "area_id" TO "areaId";
ALTER TABLE "ProductionLine" RENAME COLUMN "is_active" TO "isActive";
ALTER TABLE "ProductionLine" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "ProductionLine" RENAME COLUMN "updated_at" TO "updatedAt";

-- WorkCenter columns
ALTER TABLE "WorkCenter" RENAME COLUMN "production_line_id" TO "productionLineId";
ALTER TABLE "WorkCenter" RENAME COLUMN "capacity_unit" TO "capacityUnit";
ALTER TABLE "WorkCenter" RENAME COLUMN "is_active" TO "isActive";
ALTER TABLE "WorkCenter" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "WorkCenter" RENAME COLUMN "updated_at" TO "updatedAt";

-- Equipment columns
ALTER TABLE "Equipment" RENAME COLUMN "work_center_id" TO "workCenterId";
ALTER TABLE "Equipment" RENAME COLUMN "equipment_type" TO "equipmentType";
ALTER TABLE "Equipment" RENAME COLUMN "mqtt_node_id" TO "mqttNodeId";
ALTER TABLE "Equipment" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "Equipment" RENAME COLUMN "updated_at" TO "updatedAt";

-- User columns
ALTER TABLE "User" RENAME COLUMN "password_hash" TO "passwordHash";
ALTER TABLE "User" RENAME COLUMN "display_name" TO "displayName";
ALTER TABLE "User" RENAME COLUMN "employee_no" TO "employeeNo";
ALTER TABLE "User" RENAME COLUMN "last_login_at" TO "lastLoginAt";
ALTER TABLE "User" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "User" RENAME COLUMN "updated_at" TO "updatedAt";

-- Role columns
ALTER TABLE "Role" RENAME COLUMN "organization_id" TO "organizationId";
ALTER TABLE "Role" RENAME COLUMN "is_system" TO "isSystem";
ALTER TABLE "Role" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "Role" RENAME COLUMN "updated_at" TO "updatedAt";

-- RolePermission columns
ALTER TABLE "RolePermission" RENAME COLUMN "role_id" TO "roleId";
ALTER TABLE "RolePermission" RENAME COLUMN "permission_id" TO "permissionId";

-- UserPlantRole columns
ALTER TABLE "UserPlantRole" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "UserPlantRole" RENAME COLUMN "plant_id" TO "plantId";
ALTER TABLE "UserPlantRole" RENAME COLUMN "role_id" TO "roleId";
ALTER TABLE "UserPlantRole" RENAME COLUMN "is_active" TO "isActive";
ALTER TABLE "UserPlantRole" RENAME COLUMN "valid_from" TO "validFrom";
ALTER TABLE "UserPlantRole" RENAME COLUMN "valid_until" TO "validUntil";
ALTER TABLE "UserPlantRole" RENAME COLUMN "created_at" TO "createdAt";

-- UserSystemRole columns
ALTER TABLE "UserSystemRole" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "UserSystemRole" RENAME COLUMN "role_id" TO "roleId";
ALTER TABLE "UserSystemRole" RENAME COLUMN "is_active" TO "isActive";
ALTER TABLE "UserSystemRole" RENAME COLUMN "valid_from" TO "validFrom";
ALTER TABLE "UserSystemRole" RENAME COLUMN "valid_until" TO "validUntil";
ALTER TABLE "UserSystemRole" RENAME COLUMN "created_at" TO "createdAt";

-- Primary-key constraints; PostgreSQL renames their backing indexes too.
ALTER TABLE "Organization" RENAME CONSTRAINT "organizations_pkey" TO "Organization_pkey";
ALTER TABLE "Plant" RENAME CONSTRAINT "plants_pkey" TO "Plant_pkey";
ALTER TABLE "Area" RENAME CONSTRAINT "areas_pkey" TO "Area_pkey";
ALTER TABLE "ProductionLine" RENAME CONSTRAINT "production_lines_pkey" TO "ProductionLine_pkey";
ALTER TABLE "WorkCenter" RENAME CONSTRAINT "work_centers_pkey" TO "WorkCenter_pkey";
ALTER TABLE "Equipment" RENAME CONSTRAINT "equipment_pkey" TO "Equipment_pkey";
ALTER TABLE "User" RENAME CONSTRAINT "users_pkey" TO "User_pkey";
ALTER TABLE "Role" RENAME CONSTRAINT "roles_pkey" TO "Role_pkey";
ALTER TABLE "Permission" RENAME CONSTRAINT "permissions_pkey" TO "Permission_pkey";
ALTER TABLE "RolePermission" RENAME CONSTRAINT "role_permissions_pkey" TO "RolePermission_pkey";
ALTER TABLE "UserPlantRole" RENAME CONSTRAINT "user_plant_roles_pkey" TO "UserPlantRole_pkey";
ALTER TABLE "UserSystemRole" RENAME CONSTRAINT "user_system_roles_pkey" TO "UserSystemRole_pkey";

-- Foreign-key constraints
ALTER TABLE "Plant" RENAME CONSTRAINT "plants_organization_id_fkey" TO "Plant_organizationId_fkey";
ALTER TABLE "Area" RENAME CONSTRAINT "areas_plant_id_fkey" TO "Area_plantId_fkey";
ALTER TABLE "ProductionLine" RENAME CONSTRAINT "production_lines_area_id_fkey" TO "ProductionLine_areaId_fkey";
ALTER TABLE "WorkCenter" RENAME CONSTRAINT "work_centers_production_line_id_fkey" TO "WorkCenter_productionLineId_fkey";
ALTER TABLE "Equipment" RENAME CONSTRAINT "equipment_work_center_id_fkey" TO "Equipment_workCenterId_fkey";
ALTER TABLE "Role" RENAME CONSTRAINT "roles_organization_id_fkey" TO "Role_organizationId_fkey";
ALTER TABLE "RolePermission" RENAME CONSTRAINT "role_permissions_role_id_fkey" TO "RolePermission_roleId_fkey";
ALTER TABLE "RolePermission" RENAME CONSTRAINT "role_permissions_permission_id_fkey" TO "RolePermission_permissionId_fkey";
ALTER TABLE "UserPlantRole" RENAME CONSTRAINT "user_plant_roles_user_id_fkey" TO "UserPlantRole_userId_fkey";
ALTER TABLE "UserPlantRole" RENAME CONSTRAINT "user_plant_roles_plant_id_fkey" TO "UserPlantRole_plantId_fkey";
ALTER TABLE "UserPlantRole" RENAME CONSTRAINT "user_plant_roles_role_id_fkey" TO "UserPlantRole_roleId_fkey";
ALTER TABLE "UserSystemRole" RENAME CONSTRAINT "user_system_roles_user_id_fkey" TO "UserSystemRole_userId_fkey";
ALTER TABLE "UserSystemRole" RENAME CONSTRAINT "user_system_roles_role_id_fkey" TO "UserSystemRole_roleId_fkey";

-- Unique and secondary indexes
ALTER INDEX "organizations_code_key" RENAME TO "Organization_code_key";
ALTER INDEX "plants_organization_id_code_key" RENAME TO "Plant_organizationId_code_key";
ALTER INDEX "plants_organization_id_idx" RENAME TO "Plant_organizationId_idx";
ALTER INDEX "areas_plant_id_code_key" RENAME TO "Area_plantId_code_key";
ALTER INDEX "areas_plant_id_idx" RENAME TO "Area_plantId_idx";
ALTER INDEX "production_lines_area_id_code_key" RENAME TO "ProductionLine_areaId_code_key";
ALTER INDEX "production_lines_area_id_idx" RENAME TO "ProductionLine_areaId_idx";
ALTER INDEX "work_centers_production_line_id_code_key" RENAME TO "WorkCenter_productionLineId_code_key";
ALTER INDEX "work_centers_production_line_id_idx" RENAME TO "WorkCenter_productionLineId_idx";
ALTER INDEX "equipment_work_center_id_code_key" RENAME TO "Equipment_workCenterId_code_key";
ALTER INDEX "equipment_work_center_id_idx" RENAME TO "Equipment_workCenterId_idx";
ALTER INDEX "equipment_mqtt_node_id_idx" RENAME TO "Equipment_mqttNodeId_idx";
ALTER INDEX "users_email_key" RENAME TO "User_email_key";
ALTER INDEX "users_status_idx" RENAME TO "User_status_idx";
ALTER INDEX "roles_organization_id_code_key" RENAME TO "Role_organizationId_code_key";
ALTER INDEX "roles_organization_id_idx" RENAME TO "Role_organizationId_idx";
ALTER INDEX "roles_system_code_key" RENAME TO "Role_system_code_key";
ALTER INDEX "permissions_code_key" RENAME TO "Permission_code_key";
ALTER INDEX "user_plant_roles_user_id_plant_id_role_id_key" RENAME TO "UserPlantRole_userId_plantId_roleId_key";
ALTER INDEX "user_plant_roles_plant_id_user_id_idx" RENAME TO "UserPlantRole_plantId_userId_idx";
ALTER INDEX "user_plant_roles_user_id_is_active_idx" RENAME TO "UserPlantRole_userId_isActive_idx";
ALTER INDEX "user_system_roles_user_id_is_active_idx" RENAME TO "UserSystemRole_userId_isActive_idx";

COMMIT;
