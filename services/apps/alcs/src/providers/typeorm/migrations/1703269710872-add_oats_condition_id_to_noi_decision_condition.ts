import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOatsConditionIdToNoiDecisionCondition1703269710872
  implements MigrationInterface
{
  name = 'AddOatsConditionIdToNoiDecisionCondition1703269710872';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition" ADD "oats_condition_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision_condition"."oats_condition_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_conditions to alcs.notice_of_intent_decision_condition.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision_condition"."oats_condition_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_conditions to alcs.notice_of_intent_decision_condition.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition" DROP COLUMN "oats_condition_id"`,
    );
  }
}
