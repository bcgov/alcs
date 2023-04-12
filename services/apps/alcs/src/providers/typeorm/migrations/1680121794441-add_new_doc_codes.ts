import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNewDocCodes1680121794441 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."application_document_code" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "oats_code") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Submission - Original', 'SUBO', 'The original submission from the applicant', 'SUBORIG'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Submission - Updated', 'SUBU', 'The updated submission', 'SUBUPD');
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "alcs"."application_document_code" WHERE "code" = 'SUBO'
    `);
    await queryRunner.query(`
      DELETE FROM "alcs"."application_document_code" WHERE "code" = 'SUBU'
    `);
  }
}
