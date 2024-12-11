import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertConditionDateTypeTwoBoolsToEnum1733165843038 implements MigrationInterface {
    name = 'ConvertConditionDateTypeTwoBoolsToEnum1733165843038'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_type" DROP COLUMN "is_single_date_checked"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_type" DROP COLUMN "is_multiple_date_checked"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "is_single_date_checked"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "is_multiple_date_checked"`);
        await queryRunner.query(`CREATE TYPE "alcs"."application_decision_condition_type_date_type_enum" AS ENUM('Single', 'Multiple')`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_type" ADD "date_type" "alcs"."application_decision_condition_type_date_type_enum"`);
        await queryRunner.query(`CREATE TYPE "alcs"."notice_of_intent_decision_condition_type_date_type_enum" AS ENUM('Single', 'Multiple')`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "date_type" "alcs"."notice_of_intent_decision_condition_type_date_type_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "date_type"`);
        await queryRunner.query(`DROP TYPE "alcs"."notice_of_intent_decision_condition_type_date_type_enum"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_type" DROP COLUMN "date_type"`);
        await queryRunner.query(`DROP TYPE "alcs"."application_decision_condition_type_date_type_enum"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "is_multiple_date_checked" boolean`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "is_single_date_checked" boolean`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_type" ADD "is_multiple_date_checked" boolean`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_type" ADD "is_single_date_checked" boolean`);
    }

}
