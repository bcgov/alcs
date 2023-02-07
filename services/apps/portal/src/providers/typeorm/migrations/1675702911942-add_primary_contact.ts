import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPrimaryContact1675702911942 implements MigrationInterface {
  name = 'addPrimaryContact1675702911942';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "primary_contact_owner_uuid" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."primary_contact_owner_uuid" IS 'Stores Uuid of Owner Selected as Primary Contact'`,
    );
    await queryRunner.query(
      `INSERT INTO "portal"."application_owner_type" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Agent', 'AGEN', 'Agent');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "portal"."application_owner_type" WHERE "code" = 'AGEN';`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."primary_contact_owner_uuid" IS 'Stores Uuid of Owner Selected as Primary Contact'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "primary_contact_owner_uuid"`,
    );
  }
}
