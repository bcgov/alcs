import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeConditionDateDatesNullable1734030229522 implements MigrationInterface {
    name = 'MakeConditionDateDatesNullable1734030229522'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" ALTER COLUMN "date" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" ALTER COLUMN "date" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" ALTER COLUMN "date" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" ALTER COLUMN "date" SET NOT NULL`);
    }

}
