import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOatsComponentIdIntoNoiDecisionComponent1703182504703
  implements MigrationInterface
{
  name = 'AddOatsComponentIdIntoNoiDecisionComponent1703182504703';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_component" ADD "oats_alr_appl_component_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision_component"."oats_alr_appl_component_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_appl_components to alcs.notice_of_intent_decision_component.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision_component"."oats_alr_appl_component_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_appl_components to alcs.notice_of_intent_decision_component.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_component" DROP COLUMN "oats_alr_appl_component_id"`,
    );
  }
}
