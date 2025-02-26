import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderProperties1740423770890 implements MigrationInterface {
    name = 'AddOrderProperties1740423770890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition" ADD "order" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition" ADD "order" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition" DROP COLUMN "order"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition" DROP COLUMN "order"`);
    }

}
