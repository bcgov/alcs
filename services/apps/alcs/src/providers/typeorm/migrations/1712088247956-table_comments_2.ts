import { MigrationInterface, QueryRunner } from 'typeorm';

export class TableComments21712088247956 implements MigrationInterface {
  name = 'TableComments21712088247956';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_type" IS 'Code table for possible Notification types'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_document" IS 'Links NOI documents with the NOIs they''re saved to and logs other attributes'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_type" IS 'Code table for possible NOI types'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_submission" IS 'Portal intake form fields for NOIs'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."file_viewed" IS 'Stores when the file(Application, NOI etc.) was last viewed.'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."planning_review_type" IS 'Code table for possible Planning Review types'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."planning_review_decision_document" IS 'Links Planning Review decision document with the decision it''s saved to'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."planning_review_decision_outcome_code" IS 'Possible decision outcome types for Planning Review'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."planning_review_decision" IS 'Links Planning Review decision document with the decision it''s saved to'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."message" IS 'In-app messages'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."planning_review_decision" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."planning_review_decision_outcome_code" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."planning_review_decision_document" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."planning_review_type" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON TABLE "alcs"."file_viewed" IS NULL`);
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_submission" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_type" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_document" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_type" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON TABLE "alcs"."message" IS NULL`);
  }
}
