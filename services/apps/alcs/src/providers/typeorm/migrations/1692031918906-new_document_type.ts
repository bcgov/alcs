import { MigrationInterface, QueryRunner } from 'typeorm';

export class newDocumentType1692031918906 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "alcs"."document_code" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "oats_code") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Detailed Building Plan', 'BLDP', 'Detailed Building Plan', 'BLDP');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
