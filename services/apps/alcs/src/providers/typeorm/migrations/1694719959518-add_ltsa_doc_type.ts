import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLtsaDocType1694719959518 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "alcs"."document_code" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "oats_code") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Letter to LTSA', 'LTSA', 'Letter to LTSA', 'LTSA');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
