import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSingleConditionDates1733171051779 implements MigrationInterface {
  name = 'RemoveSingleConditionDates1733171051779';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition" DROP COLUMN "completion_date"`);
    await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition" DROP COLUMN "single_date"`);
    await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition" DROP COLUMN "completion_date"`);
    await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition" DROP COLUMN "single_date"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition" ADD "single_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition" ADD "completion_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" ADD "single_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" ADD "completion_date" TIMESTAMP WITH TIME ZONE`,
    );
  }
}
