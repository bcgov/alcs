import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateDecisionOutcomes1698076577193 implements MigrationInterface {
  name = 'updateDecisionOutcomes1698076577193';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "alcs"."application_decision" SET "outcome_code" = 'REFU' WHERE "outcome_code" IN ('REVE', 'CONF')`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_decision" SET "outcome_code" = 'APPR' WHERE "outcome_code" IN ('VARY', 'APPA')`,
    );
    await queryRunner.query(
      `DELETE FROM "alcs"."application_decision_outcome_code" WHERE "code" IN ('REVE', 'CONF', 'VARY', 'APPA')`,
    );
  }

  public async down(): Promise<void> {
    //No
  }
}
