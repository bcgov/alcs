import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOatsDecisionColumn1702683299770 implements MigrationInterface {
  name = 'AddOatsDecisionColumn1702683299770';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD "oats_alr_appl_decision_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."oats_alr_appl_decision_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_appl_decisions to alcs.notice_of_intent_decisions.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."oats_alr_appl_decision_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_appl_decisions to alcs.notice_of_intent_decisions.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "oats_alr_appl_decision_id"`,
    );
  }
}
