import { MigrationInterface, QueryRunner } from 'typeorm';

export class planNumberTable1691013372543 implements MigrationInterface {
  name = 'planNumberTable1691013372543';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" DROP CONSTRAINT "FK_e338f87b58995583ec5724b0e39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" DROP CONSTRAINT "FK_f24a7edb8682b081c694578dba4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" DROP COLUMN "condition_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" DROP COLUMN "component_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" ADD CONSTRAINT "FK_e9c8eae0a03c6816475ece8a702" FOREIGN KEY ("application_decision_condition_uuid") REFERENCES "alcs"."application_decision_condition"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" ADD CONSTRAINT "FK_0a2a0d208d27cd9d9a5577ac89b" FOREIGN KEY ("application_decision_component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" DROP CONSTRAINT "FK_0a2a0d208d27cd9d9a5577ac89b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" DROP CONSTRAINT "FK_e9c8eae0a03c6816475ece8a702"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" ADD "component_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" ADD "condition_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" ADD CONSTRAINT "FK_f24a7edb8682b081c694578dba4" FOREIGN KEY ("component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component_plan_number" ADD CONSTRAINT "FK_e338f87b58995583ec5724b0e39" FOREIGN KEY ("condition_uuid") REFERENCES "alcs"."application_decision_condition"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
