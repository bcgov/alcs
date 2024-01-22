import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGovernmentOwnerType1689806720586 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."application_owner_type"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Government', 'GOVR', 'For use by LFNG to select themselves');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."application_owner_type" WHERE "code" = 'GOVR'`,
    );
  }
}
