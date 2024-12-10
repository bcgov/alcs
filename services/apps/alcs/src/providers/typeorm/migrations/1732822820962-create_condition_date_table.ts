import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConditionDateTable1732822820962 implements MigrationInterface {
    name = 'CreateConditionDateTable1732822820962'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "alcs"."application_decision_condition_date" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "date" TIMESTAMP WITH TIME ZONE NOT NULL, "comment" text NOT NULL DEFAULT '', "condition_uuid" uuid, CONSTRAINT "PK_975ef9c1b95fa790b980eb8038a" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."application_decision_condition_date" IS 'Due/end dates for conditions'`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" ADD CONSTRAINT "FK_b7a541bf441dc27322bd2acc473" FOREIGN KEY ("condition_uuid") REFERENCES "alcs"."application_decision_condition"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_date" DROP CONSTRAINT "FK_b7a541bf441dc27322bd2acc473"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."application_decision_condition_date" IS NULL`);
        await queryRunner.query(`DROP TABLE "alcs"."application_decision_condition_date"`);
    }

}
