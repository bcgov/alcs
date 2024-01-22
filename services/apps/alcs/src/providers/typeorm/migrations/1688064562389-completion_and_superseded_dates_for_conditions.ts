import { MigrationInterface, QueryRunner } from 'typeorm';

export class completionAndSupersededDatesForConditions1688064562389
  implements MigrationInterface
{
  name = 'completionAndSupersededDatesForConditions1688064562389';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" ADD "completion_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_condition"."completion_date" IS 'Condition Completion date'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" ADD "superseded_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_condition"."superseded_date" IS 'Condition Superseded date'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_condition"."superseded_date" IS 'Condition Superseded date'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" DROP COLUMN "superseded_date"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_condition"."completion_date" IS 'Condition Completion date'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" DROP COLUMN "completion_date"`,
    );
  }
}
