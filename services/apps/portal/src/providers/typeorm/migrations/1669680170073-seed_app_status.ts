import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedAppStatus1669680170073 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "portal"."application_status" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Cancelled', 'CANC', 'Application has been cancelled by the applicant'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'In Progress', 'PROG', 'Application is in progress and has not been submitted'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Submitted', 'SUBM', 'Application has been submitted');
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE from "portal"."application_status"');
  }
}
