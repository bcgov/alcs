import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLgAppStatuses1673392914204 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "portal"."application_status" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Under Review by L/FNG', 'REVW', 'Application is currently being reviewed by L/FNG'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'L/FNG Refused to Forward', 'REFU', 'Application was reviewed and refused by L/FNG');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "portal"."application_status" WHERE "code" = 'REFU'
    `);
    await queryRunner.query(`
      DELETE FROM "portal"."application_status" WHERE "code" = 'REVW'
    `);
  }
}
