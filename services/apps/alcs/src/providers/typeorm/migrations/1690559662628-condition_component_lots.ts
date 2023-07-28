import { MigrationInterface, QueryRunner } from 'typeorm';

export class conditionComponentLots1690559662628 implements MigrationInterface {
  name = 'conditionComponentLots1690559662628';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_decision_component_lot" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "number" integer NOT NULL, "type" text, "alr_area" integer, "size" integer, "component_uuid" uuid, CONSTRAINT "REL_040a878c55a37efa00fbb10e19" UNIQUE ("component_uuid"), CONSTRAINT "PK_5572331a2f8315a1efffa08928d" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_decision_condition_to_component_lot" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "plan_numbers" text NOT NULL, "component_uuid" uuid NOT NULL, "condition_uuid" uuid, CONSTRAINT "PK_9c03e6af9a3996fcccf250ca610" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" ADD CONSTRAINT "FK_040a878c55a37efa00fbb10e196" FOREIGN KEY ("component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_to_component_lot" ADD CONSTRAINT "FK_6f3949c7e48200c116ab6a9814a" FOREIGN KEY ("component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_to_component_lot" ADD CONSTRAINT "FK_6b5ee63fc75f3a551029c07bc38" FOREIGN KEY ("condition_uuid") REFERENCES "alcs"."application_decision_condition"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_to_component_lot" DROP CONSTRAINT "FK_6b5ee63fc75f3a551029c07bc38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_to_component_lot" DROP CONSTRAINT "FK_6f3949c7e48200c116ab6a9814a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" DROP CONSTRAINT "FK_040a878c55a37efa00fbb10e196"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_decision_condition_to_component_lot"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_decision_component_lot"`,
    );
  }
}
