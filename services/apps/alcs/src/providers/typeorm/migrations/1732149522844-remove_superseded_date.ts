import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveSupersededDate1732149522844 implements MigrationInterface {
    name = 'RemoveSupersededDate1732149522844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition" DROP COLUMN "superseded_date"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition" DROP COLUMN "superseded_date"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition" ADD "superseded_date" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition" ADD "superseded_date" TIMESTAMP WITH TIME ZONE`);
    }

}
