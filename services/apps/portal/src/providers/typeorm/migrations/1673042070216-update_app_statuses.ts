import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateAppStatuses1673042070216 implements MigrationInterface {
  name = 'updateAppStatuses1673042070216';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "portal"."application_status" SET "label" = 'Submitted to ALC' WHERE "code" = 'SUBM'`,
    );

    await queryRunner.query(`
      INSERT INTO "portal"."application_status" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Submitted to L/FNG', 'SUBG', 'Application is ready to be reviewed by L/FNG')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "portal"."application_status" SET "label"='Submitted' WHERE "code" = 'SUBM'`,
    );

    await queryRunner.query(`
      DELETE FROM "portal"."application_status" WHERE "code" = 'SUBG'
    `);
  }
}
