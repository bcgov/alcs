import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColsAndContraintToInqDocs1712618156742
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_document" ADD "oats_document_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_document" ADD "oats_issue_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ADD "oats_issue_id" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."inquiry_document"."oats_document_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.inquiry_document.'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."inquiry_document"."oats_issue_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.inquiry_document.'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."document"."oats_issue_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.document.'`,
    );
    await queryRunner.query(
      `ALTER TABLE alcs.inquiry_document ADD CONSTRAINT unique_oats_issue_ids UNIQUE(oats_document_id, oats_issue_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_document" DROP CONSTRAINT unique_oats_issue_ids`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."inquiry_document"."oats_document_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.inquiry_document.'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."inquiry_document"."oats_issue_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.inquiry_document.'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."document"."oats_issue_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.document.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_document" DROP COLUMN "oats_document_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_document" DROP COLUMN "oats_issue_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" DROP COLUMN "oats_issue_id"`,
    );
  }
}
