import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSecondEndDateForDecs1699037990967
  implements MigrationInterface
{
  name = 'addSecondEndDateForDecs1699037990967';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "proposal_end_date2" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."proposal_end_date2" IS 'The date at which the placement of fill ends (PFRS only)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "end_date2" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_component"."end_date2" IS 'Components second end date (PFRS only)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "proposal_end_date2" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."proposal_end_date2" IS 'The date at which the placement of fill ends (PFRS only)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_component" ADD "end_date2" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision_component"."end_date2" IS 'Components second end date (PFRS only)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_component"."end_date" IS 'Components end date'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_component"."expiry_date" IS 'Components expiry date'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision_component"."end_date" IS 'Components end date'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision_component"."end_date" IS 'Components\` end date'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_component"."expiry_date" IS 'Components\` expiry date'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_component"."end_date" IS 'Components\` end date'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision_component"."end_date2" IS 'Components second end date (PFRS only)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_component" DROP COLUMN "end_date2"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."proposal_end_date2" IS 'The date at which the placement of fill ends (PFRS only)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "proposal_end_date2"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_component"."end_date2" IS 'Components second end date (PFRS only)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "end_date2"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."proposal_end_date2" IS 'The date at which the placement of fill ends (PFRS only)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "proposal_end_date2"`,
    );
  }
}
