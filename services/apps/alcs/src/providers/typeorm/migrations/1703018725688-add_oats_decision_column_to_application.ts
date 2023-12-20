import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOatsDecisionColumnToApplication1703018725688
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "oats_alr_appl_decision_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."oats_alr_appl_decision_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_appl_decisions to alcs.application_decisions.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."oats_alr_appl_decision_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_appl_decisions to alcs.application_decisions.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "oats_alr_appl_decision_id"`,
    );
  }
}
