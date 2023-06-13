import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDocType1686340435992 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."application_document_code"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "oats_code", "portal_label") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Applicant Meeting Report', 'AMRP', 'Applicant Meeting Report', 'AMR', NULL);
    `);

    await queryRunner.query(`
      UPDATE "alcs"."board_status" SET "order" = 1 WHERE "uuid" = 'd2150e74-55b8-48a5-86c5-579d1856ade2';
      UPDATE "alcs"."board_status" SET "order" = 3 WHERE "uuid" = 'a842b9f3-3ca0-49a7-88ec-71883e837da6';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
