import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNowFiletype1683303114252 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."application_document_code" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "oats_code") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Notice of Work', 'NOWE', 'Notice of Work for EMLI', 'NOW');
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "alcs"."application_document_code" WHERE "code" = 'NOWE'
    `);
  }
}
