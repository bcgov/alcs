import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminNoiConditionTypesFields1732233064677 implements MigrationInterface {
  name = 'AddAdminNoiConditionTypesFields1732233064677';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "is_component_to_condition_checked" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "is_description_checked" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "is_administrative_fee_amount_checked" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "is_administrative_fee_amount_required" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "administrative_fee_amount" numeric(8,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "is_single_date_checked" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "is_single_date_required" boolean`,
    );
    await queryRunner.query(
      `CREATE TYPE "alcs"."notice_of_intent_decision_condition_type_single_date_label_enum" AS ENUM('Due Date', 'End Date')`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "single_date_label" "alcs"."notice_of_intent_decision_condition_type_single_date_label_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "is_security_amount_checked" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "is_security_amount_required" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition" ADD "single_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision_condition"."single_date" IS 'Condition single end/due date'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision_condition"."single_date" IS 'Condition single end/due date'`,
    );
    await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition" DROP COLUMN "single_date"`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "is_security_amount_required"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "is_security_amount_checked"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "single_date_label"`,
    );
    await queryRunner.query(`DROP TYPE "alcs"."notice_of_intent_decision_condition_type_single_date_label_enum"`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "is_single_date_required"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "is_single_date_checked"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "administrative_fee_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "is_administrative_fee_amount_required"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "is_administrative_fee_amount_checked"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "is_description_checked"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "is_component_to_condition_checked"`,
    );
  }
}
