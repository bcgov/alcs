import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeConditionDateConditionUuidNotNullable1734395531473 implements MigrationInterface {
    name = 'MakeConditionDateConditionUuidNotNullable1734395531473'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" DROP CONSTRAINT "FK_b7a541bf441dc27322bd2acc473"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" ALTER COLUMN "condition_uuid" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" DROP CONSTRAINT "FK_0bd2f73af4ca611761c69769fc2"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" ALTER COLUMN "condition_uuid" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" ADD CONSTRAINT "FK_b7a541bf441dc27322bd2acc473" FOREIGN KEY ("condition_uuid") REFERENCES "alcs"."application_decision_condition"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" ADD CONSTRAINT "FK_0bd2f73af4ca611761c69769fc2" FOREIGN KEY ("condition_uuid") REFERENCES "alcs"."notice_of_intent_decision_condition"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" DROP CONSTRAINT "FK_0bd2f73af4ca611761c69769fc2"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" DROP CONSTRAINT "FK_b7a541bf441dc27322bd2acc473"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" ALTER COLUMN "condition_uuid" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" ADD CONSTRAINT "FK_0bd2f73af4ca611761c69769fc2" FOREIGN KEY ("condition_uuid") REFERENCES "alcs"."notice_of_intent_decision_condition"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" ALTER COLUMN "condition_uuid" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" ADD CONSTRAINT "FK_b7a541bf441dc27322bd2acc473" FOREIGN KEY ("condition_uuid") REFERENCES "alcs"."application_decision_condition"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
