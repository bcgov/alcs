import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOatsCondidionIdToAppDecisionCondition1705361630015
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" ADD "oats_condition_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_condition"."oats_condition_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_conditions to alcs.application_decision_condition.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_condition"."oats_condition_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_conditions to alcs.application_decision_condition.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" DROP COLUMN "oats_condition_id"`,
    );
  }
}
