import { MigrationInterface, QueryRunner } from "typeorm";

export class AddApplicationDecisionConditionCard1736448476896 implements MigrationInterface {
    name = 'AddApplicationDecisionConditionCard1736448476896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "alcs"."application_decision_condition_card" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "card_uuid" uuid NOT NULL, "decision_uuid" uuid NOT NULL, CONSTRAINT "REL_0fe3f690fa9452bf4b66c61408" UNIQUE ("card_uuid"), CONSTRAINT "PK_e4ba515d1fc9c054f566ea71846" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."application_decision_condition_card" IS 'Links application decision conditions with cards'`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition" ADD "condition_card_uuid" uuid`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_card" ADD CONSTRAINT "FK_0fe3f690fa9452bf4b66c614083" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_card" ADD CONSTRAINT "FK_479c2feaef6520e2a351f3e7e57" FOREIGN KEY ("decision_uuid") REFERENCES "alcs"."application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition" ADD CONSTRAINT "FK_ae868c3100cf95c50d1052a3923" FOREIGN KEY ("condition_card_uuid") REFERENCES "alcs"."application_decision_condition_card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition" DROP CONSTRAINT "FK_ae868c3100cf95c50d1052a3923"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_card" DROP CONSTRAINT "FK_479c2feaef6520e2a351f3e7e57"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_card" DROP CONSTRAINT "FK_0fe3f690fa9452bf4b66c614083"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition" DROP COLUMN "condition_card_uuid"`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."application_decision_condition_card" IS NULL`);
        await queryRunner.query(`DROP TABLE "alcs"."application_decision_condition_card"`);
    }

}
