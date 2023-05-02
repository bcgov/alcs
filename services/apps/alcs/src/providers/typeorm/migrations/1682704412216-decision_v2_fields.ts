import { MigrationInterface, QueryRunner } from 'typeorm';

export class decisionV2Fields1682704412216 implements MigrationInterface {
  name = 'decisionV2Fields1682704412216';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "is_subject_to_conditions" boolean`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."is_subject_to_conditions" IS 'Indicates whether the decision is subject to conditions'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "decision_description" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."decision_description" IS 'Staff input field for a description of the decision'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "is_stats_required" boolean`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."is_stats_required" IS 'Indicates whether the stats are required for the decision'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "days_hide_from_public" integer`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."days_hide_from_public" IS 'Indicates how long the decision should stay hidden from public in days from decision date'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "rescinded_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."rescinded_date" IS 'Date when decision was rescinded'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "rescinded_comment" character varying`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."rescinded_comment" IS 'Comment provided by the staff when the decision was rescinded'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."rescinded_comment" IS 'Comment provided by the staff when the decision was rescinded'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "rescinded_comment"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."rescinded_date" IS 'Date when decision was rescinded'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "rescinded_date"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."days_hide_from_public" IS 'Indicates how long the decision should stay hidden from public in days from decision date'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "days_hide_from_public"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."is_stats_required" IS 'Indicates whether the stats are required for the decision'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "is_stats_required"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."decision_description" IS 'Staff input field for a description of the decision'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "decision_description"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."is_subject_to_conditions" IS 'Indicates whether the decision is subject to conditions'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "is_subject_to_conditions"`,
    );
  }
}
