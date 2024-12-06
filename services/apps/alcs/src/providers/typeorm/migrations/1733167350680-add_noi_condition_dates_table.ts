import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNoiConditionDatesTable1733167350680 implements MigrationInterface {
    name = 'AddNoiConditionDatesTable1733167350680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "alcs"."notice_of_intent_decision_condition_date" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "date" TIMESTAMP WITH TIME ZONE NOT NULL, "comment" text NOT NULL DEFAULT '', "condition_uuid" uuid, CONSTRAINT "PK_1a1bb2685255cc143b6acbf1ff5" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."notice_of_intent_decision_condition_date" IS 'Due/end dates for conditions'`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" ADD CONSTRAINT "FK_0bd2f73af4ca611761c69769fc2" FOREIGN KEY ("condition_uuid") REFERENCES "alcs"."notice_of_intent_decision_condition"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition_date" DROP CONSTRAINT "FK_0bd2f73af4ca611761c69769fc2"`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."notice_of_intent_decision_condition_date" IS NULL`);
        await queryRunner.query(`DROP TABLE "alcs"."notice_of_intent_decision_condition_date"`);
    }

}
