import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConditionDateCompletedDate1733176559790 implements MigrationInterface {
    name = 'AddConditionDateCompletedDate1733176559790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" ADD "completed_date" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" ADD "completed_date" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" DROP COLUMN "completed_date"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" DROP COLUMN "completed_date"`);
    }

}
