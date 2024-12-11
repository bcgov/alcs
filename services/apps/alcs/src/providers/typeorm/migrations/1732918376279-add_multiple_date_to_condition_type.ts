import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMultipleDateToConditionType1732918376279 implements MigrationInterface {
  name = 'AddMultipleDateToConditionType1732918376279';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_type" DROP COLUMN "is_single_date_required"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "is_single_date_required"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_type" ADD "is_date_checked" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_type" ADD "is_date_required" boolean`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_type" ADD "is_multiple_date_checked" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "is_date_checked" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "is_date_required" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "is_multiple_date_checked" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_type" ALTER COLUMN "is_single_date_checked" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_type" ALTER COLUMN "is_single_date_checked" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ALTER COLUMN "is_single_date_checked" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ALTER COLUMN "is_single_date_checked" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ALTER COLUMN "is_single_date_checked" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ALTER COLUMN "is_single_date_checked" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_type" ALTER COLUMN "is_single_date_checked" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_type" ALTER COLUMN "is_single_date_checked" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "is_multiple_date_checked"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "is_date_required"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "is_date_checked"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_type" DROP COLUMN "is_multiple_date_checked"`,
    );
    await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_type" DROP COLUMN "is_date_required"`);
    await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_type" DROP COLUMN "is_date_checked"`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "is_single_date_required" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_type" ADD "is_single_date_required" boolean`,
    );
  }
}
