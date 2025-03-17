import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveObsoleteFields1742250112908 implements MigrationInterface {
    name = 'RemoveObsoleteFields1742250112908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "end_date"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "expiry_date"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "end_date2"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition" DROP COLUMN "approval_dependant"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "proposal_end_date"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "proposal_end_date2"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application" DROP COLUMN "proposal_end_date"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application" DROP COLUMN "proposal_expiry_date"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application" DROP COLUMN "proposal_end_date2"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition" DROP COLUMN "approval_dependant"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_component" DROP COLUMN "end_date"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_component" DROP COLUMN "expiry_date"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_component" DROP COLUMN "end_date2"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_component" ADD "end_date2" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_component" ADD "expiry_date" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_component" ADD "end_date" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition" ADD "approval_dependant" boolean`);
        await queryRunner.query(`ALTER TABLE "alcs"."application" ADD "proposal_end_date2" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."application" ADD "proposal_expiry_date" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."application" ADD "proposal_end_date" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent" ADD "proposal_end_date2" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent" ADD "proposal_end_date" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition" ADD "approval_dependant" boolean`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_component" ADD "end_date2" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_component" ADD "expiry_date" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_component" ADD "end_date" TIMESTAMP WITH TIME ZONE`);
    }

}
