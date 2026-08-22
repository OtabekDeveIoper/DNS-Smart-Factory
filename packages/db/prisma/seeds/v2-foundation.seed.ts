import type { PrismaClient } from "../../generated/prisma/client.cjs";
import { EquipmentStatus, UserStatus } from "../../generated/prisma/client.cjs";

import {
  DEFAULT_ROLE_CODES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
} from "./rbac.catalog";

export async function seedV2Foundation(prisma: PrismaClient) {
  // ---------------------------------------------------------
  // Organization
  // ---------------------------------------------------------

  const organization = await prisma.organization.upsert({
    where: {
      code: "DNS",
    },
    update: {
      name: "DNS Smart Factory",
      timezone: "Asia/Seoul",
      isActive: true,
    },
    create: {
      code: "DNS",
      name: "DNS Smart Factory",
      timezone: "Asia/Seoul",
    },
  });

  // ---------------------------------------------------------
  // Plant hierarchy
  // ---------------------------------------------------------

  const plant = await prisma.plant.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "PLANT-01",
      },
    },
    update: {
      name: "DNS Main Plant",
      timezone: "Asia/Seoul",
      isActive: true,
    },
    create: {
      organizationId: organization.id,
      code: "PLANT-01",
      name: "DNS Main Plant",
      timezone: "Asia/Seoul",
    },
  });

  const area = await prisma.area.upsert({
    where: {
      plantId_code: {
        plantId: plant.id,
        code: "ASSEMBLY",
      },
    },
    update: {
      name: "Assembly Area",
      isActive: true,
    },
    create: {
      plantId: plant.id,
      code: "ASSEMBLY",
      name: "Assembly Area",
    },
  });

  const productionLine = await prisma.productionLine.upsert({
    where: {
      areaId_code: {
        areaId: area.id,
        code: "LINE-01",
      },
    },
    update: {
      name: "Main Production Line",
      isActive: true,
    },
    create: {
      areaId: area.id,
      code: "LINE-01",
      name: "Main Production Line",
    },
  });

  const workCenter = await prisma.workCenter.upsert({
    where: {
      productionLineId_code: {
        productionLineId: productionLine.id,
        code: "WC-WIRING",
      },
    },
    update: {
      name: "Wiring Work Center",
      capacity: 1,
      capacityUnit: "UNIT",
      isActive: true,
    },
    create: {
      productionLineId: productionLine.id,
      code: "WC-WIRING",
      name: "Wiring Work Center",
      capacity: 1,
      capacityUnit: "UNIT",
    },
  });

  await prisma.equipment.upsert({
    where: {
      workCenterId_code: {
        workCenterId: workCenter.id,
        code: "CAM-01",
      },
    },
    update: {
      name: "AI Wiring Camera 01",
      equipmentType: "VISION_CAMERA",
      status: EquipmentStatus.ACTIVE,
    },
    create: {
      workCenterId: workCenter.id,
      code: "CAM-01",
      name: "AI Wiring Camera 01",
      equipmentType: "VISION_CAMERA",
      status: EquipmentStatus.ACTIVE,
      mqttNodeId: "dns/plant-01/line-01/wiring/cam-01",
    },
  });

  // ---------------------------------------------------------
  // Permission catalog
  // ---------------------------------------------------------

  const permissionByCode = new Map<string, string>();

  for (const code of Object.values(PERMISSIONS)) {
    const permission = await prisma.permission.upsert({
      where: {
        code,
      },
      update: {
        description: code,
      },
      create: {
        code,
        description: code,
      },
    });

    permissionByCode.set(code, permission.id);
  }

  // ---------------------------------------------------------
  // Roles
  // ---------------------------------------------------------

  const roleByCode = new Map<string, string>();

  for (const [key, code] of Object.entries(DEFAULT_ROLE_CODES)) {
    const isSystemAdmin = code === DEFAULT_ROLE_CODES.SYSTEM_ADMIN;

    let role;

    if (isSystemAdmin) {
      const existing = await prisma.role.findFirst({
        where: {
          organizationId: null,
          code,
        },
      });

      role = existing
        ? await prisma.role.update({
            where: {
              id: existing.id,
            },
            data: {
              name: humanizeRole(code),
              isSystem: true,
            },
          })
        : await prisma.role.create({
            data: {
              organizationId: null,
              code,
              name: humanizeRole(code),
              isSystem: true,
            },
          });
    } else {
      role = await prisma.role.upsert({
        where: {
          organizationId_code: {
            organizationId: organization.id,
            code,
          },
        },
        update: {
          name: humanizeRole(code),
          isSystem: true,
        },
        create: {
          organizationId: organization.id,
          code,
          name: humanizeRole(code),
          isSystem: true,
        },
      });
    }

    roleByCode.set(key, role.id);
  }

  // ---------------------------------------------------------
  // Role -> Permission assignments
  // ---------------------------------------------------------

  for (const [roleCode, permissionCodes] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleByCode.get(roleCode);

    if (!roleId) {
      throw new Error(`Seed role not found: ${roleCode}`);
    }

    const permissionIds = permissionCodes.map((permissionCode) => {
      const permissionId = permissionByCode.get(permissionCode);

      if (!permissionId) {
        throw new Error(`Seed permission not found: ${permissionCode}`);
      }

      return permissionId;
    });

    // Default system roles must exactly match the code-defined catalog.
    await prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: {
          notIn: permissionIds,
        },
      },
    });

    for (const permissionId of permissionIds) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId,
        },
      });
    }
  }

  // ---------------------------------------------------------
  // Development bootstrap identities
  // ---------------------------------------------------------

  const systemAdmin = await prisma.user.upsert({
    where: {
      email: "admin@dns.local",
    },
    update: {
      displayName: "Development System Admin",
      status: UserStatus.ACTIVE,
      locale: "ko",
    },
    create: {
      email: "admin@dns.local",
      displayName: "Development System Admin",
      status: UserStatus.ACTIVE,
      locale: "ko",
    },
  });

  const systemAdminRoleId = roleByCode.get("SYSTEM_ADMIN");

  if (!systemAdminRoleId) {
    throw new Error("SYSTEM_ADMIN role was not created");
  }

  await prisma.userSystemRole.upsert({
    where: {
      userId_roleId: {
        userId: systemAdmin.id,
        roleId: systemAdminRoleId,
      },
    },
    update: {
      isActive: true,
    },
    create: {
      userId: systemAdmin.id,
      roleId: systemAdminRoleId,
      isActive: true,
    },
  });

  const plantManager = await prisma.user.upsert({
    where: {
      email: "manager@dns.local",
    },
    update: {
      displayName: "Development Plant Manager",
      status: UserStatus.ACTIVE,
      locale: "ko",
    },
    create: {
      email: "manager@dns.local",
      displayName: "Development Plant Manager",
      status: UserStatus.ACTIVE,
      locale: "ko",
    },
  });

  const plantManagerRoleId = roleByCode.get("PLANT_MANAGER");

  if (!plantManagerRoleId) {
    throw new Error("PLANT_MANAGER role was not created");
  }

  await prisma.userPlantRole.upsert({
    where: {
      userId_plantId_roleId: {
        userId: plantManager.id,
        plantId: plant.id,
        roleId: plantManagerRoleId,
      },
    },
    update: {
      isActive: true,
    },
    create: {
      userId: plantManager.id,
      plantId: plant.id,
      roleId: plantManagerRoleId,
      isActive: true,
    },
  });

  return {
    organizationId: organization.id,
    plantId: plant.id,
  };
}

interface V2FoundationContext {
  organizationId: string;
  plantId: string;
}

export async function backfillV2Ownership(
  prisma: PrismaClient,
  context: V2FoundationContext,
) {
  await prisma.customer.updateMany({
    where: { organizationId: null },
    data: { organizationId: context.organizationId },
  });

  await prisma.material.updateMany({
    where: { organizationId: null },
    data: { organizationId: context.organizationId },
  });

  await prisma.order.updateMany({
    where: { plantId: null },
    data: { plantId: context.plantId },
  });

  await prisma.inventoryLot.updateMany({
    where: { plantId: null },
    data: { plantId: context.plantId },
  });
}

function humanizeRole(code: string): string {
  return code
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
