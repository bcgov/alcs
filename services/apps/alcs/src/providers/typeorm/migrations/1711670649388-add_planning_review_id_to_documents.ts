import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlanningReviewIdToDocuments1711670649388
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_document" ADD "oats_document_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_document" ADD "oats_planning_review_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ADD "oats_planning_review_id" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."planning_review_document"."oats_document_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.planning_review_document.'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."planning_review_document"."oats_planning_review_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.planning_review_document.'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."document"."oats_planning_review_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.document.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."planning_review_document"."oats_document_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.planning_review_document.'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."planning_review_document"."oats_planning_review_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.planning_review_document.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_document" DROP COLUMN "oats_document_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_document" DROP COLUMN "oats_planning_review_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" DROP COLUMN "oats_planning_review_id"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."document"."oats_planning_review_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.document.'`,
    );
  }
}
