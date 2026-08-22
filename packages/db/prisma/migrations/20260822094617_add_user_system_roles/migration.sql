-- CreateTable
CREATE TABLE "user_system_roles" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_system_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateIndex
CREATE INDEX "user_system_roles_user_id_is_active_idx" ON "user_system_roles"("user_id", "is_active");

-- AddForeignKey
ALTER TABLE "user_system_roles" ADD CONSTRAINT "user_system_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_system_roles" ADD CONSTRAINT "user_system_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- PostgreSQL permits duplicate NULL values in a regular composite unique index.
-- This index keeps global role codes unique when organization_id is NULL.
CREATE UNIQUE INDEX "roles_system_code_key"
ON "roles" ("code")
WHERE "organization_id" IS NULL;