import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEtlRelatedFieldsToDocs1681858501523
  implements MigrationInterface
{
  name = 'addEtlRelatedFieldsToDocs1681858501523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ADD "oats_application_id" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."document"."oats_application_id" IS 'used only for oats etl process'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ADD "oats_document_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ADD CONSTRAINT "UQ_f6c871d5b58bfa1148ac728e2ac" UNIQUE ("oats_document_id")`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."document"."oats_document_id" IS 'used only for oats etl process'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ADD "oats_document_id" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_document"."oats_document_id" IS 'used only for oats etl process'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ADD "oats_application_id" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_document"."oats_application_id" IS 'used only for oats etl process'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ADD "audit_created_by" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_document"."audit_created_by" IS 'used only for oats etl process'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission"."subd_proposed_lots" IS 'JSONB Column containing the proposed subdivision lots'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ADD CONSTRAINT "OATS_UQ_DOCUMENTS" UNIQUE ("oats_document_id", "oats_application_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" DROP CONSTRAINT "OATS_UQ_DOCUMENTS"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission"."subd_proposed_lots" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_document"."audit_created_by" IS 'used only for oats etl process'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" DROP COLUMN "audit_created_by"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_document"."oats_application_id" IS 'used only for oats etl process'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" DROP COLUMN "oats_application_id"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_document"."oats_document_id" IS 'used only for oats etl process'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" DROP COLUMN "oats_document_id"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."document"."oats_document_id" IS 'used only for oats etl process'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" DROP CONSTRAINT "UQ_f6c871d5b58bfa1148ac728e2ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" DROP COLUMN "oats_document_id"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."document"."oats_application_id" IS 'used only for oats etl process'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" DROP COLUMN "oats_application_id"`,
    );
  }
}
