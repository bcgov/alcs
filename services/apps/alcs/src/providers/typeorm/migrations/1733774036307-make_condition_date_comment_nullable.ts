import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeConditionDateCommentNullable1733774036307 implements MigrationInterface {
    name = 'MakeConditionDateCommentNullable1733774036307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" ALTER COLUMN "comment" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" ALTER COLUMN "comment" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" ALTER COLUMN "comment" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" ALTER COLUMN "comment" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" ALTER COLUMN "comment" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" ALTER COLUMN "comment" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" ALTER COLUMN "comment" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" ALTER COLUMN "comment" SET NOT NULL`);
    }

}
