import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConditionCompletionDate1733169971678 implements MigrationInterface {
    name = 'AddConditionCompletionDate1733169971678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" ADD "completed_date" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" ADD "completed_date" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" DROP COLUMN "completed_date"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" DROP COLUMN "completed_date"`);
    }

}
