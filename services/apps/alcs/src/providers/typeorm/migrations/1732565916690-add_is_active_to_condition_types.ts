import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveToConditionTypes1732565916690 implements MigrationInterface {
    name = 'AddIsActiveToConditionTypes1732565916690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_type" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition" ADD "is_active" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_type" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_type" DROP COLUMN "is_active"`);
    }

}
