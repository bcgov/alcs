import { MigrationInterface, QueryRunner } from 'typeorm';

export class planNumber1691021151956 implements MigrationInterface {
  name = 'planNumber1691021151956';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_e88e4a5dc4db0a7ba934b99dbe0"`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_decision_condition_to_component_lot" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "plan_numbers" text NOT NULL, "condition_uuid" uuid, "component_lot_uuid" uuid NOT NULL, CONSTRAINT "PK_9c03e6af9a3996fcccf250ca610" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_decision_component_lot" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "index" integer NOT NULL, "type" text, "alr_area" numeric(12,2), "size" numeric(12,2), "component_uuid" uuid NOT NULL, CONSTRAINT "PK_5572331a2f8315a1efffa08928d" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_decision_condition_component_plan_number" ("application_decision_condition_uuid" uuid NOT NULL, "application_decision_component_uuid" uuid NOT NULL, "plan_numbers" text, CONSTRAINT "PK_272dd82d4108601a66fcc786715" PRIMARY KEY ("application_decision_condition_uuid", "application_decision_component_uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "subd_approved_lots"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_to_component_lot" ADD CONSTRAINT "FK_6b5ee63fc75f3a551029c07bc38" FOREIGN KEY ("condition_uuid") REFERENCES "alcs"."application_decision_condition"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_to_component_lot" ADD CONSTRAINT "FK_c41ec91b3f32c215e495770a2e1" FOREIGN KEY ("component_lot_uuid") REFERENCES "alcs"."application_decision_component_lot"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" ADD CONSTRAINT "FK_040a878c55a37efa00fbb10e196" FOREIGN KEY ("component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" ADD CONSTRAINT "FK_e9c8eae0a03c6816475ece8a702" FOREIGN KEY ("application_decision_condition_uuid") REFERENCES "alcs"."application_decision_condition"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" ADD CONSTRAINT "FK_0a2a0d208d27cd9d9a5577ac89b" FOREIGN KEY ("application_decision_component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_dc34f50291af0299bd44e8d0448" FOREIGN KEY ("chair_review_outcome_code") REFERENCES "alcs"."application_decision_chair_review_outcome_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_dc34f50291af0299bd44e8d0448"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" DROP CONSTRAINT "FK_0a2a0d208d27cd9d9a5577ac89b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" DROP CONSTRAINT "FK_e9c8eae0a03c6816475ece8a702"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" DROP CONSTRAINT "FK_040a878c55a37efa00fbb10e196"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_to_component_lot" DROP CONSTRAINT "FK_c41ec91b3f32c215e495770a2e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_to_component_lot" DROP CONSTRAINT "FK_6b5ee63fc75f3a551029c07bc38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "subd_approved_lots" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_decision_condition_component_plan_number"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_decision_component_lot"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_decision_condition_to_component_lot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_e88e4a5dc4db0a7ba934b99dbe0" FOREIGN KEY ("chair_review_outcome_code") REFERENCES "alcs"."application_decision_chair_review_outcome_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
