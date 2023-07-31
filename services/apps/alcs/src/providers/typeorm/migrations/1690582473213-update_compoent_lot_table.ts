import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateCompoentLotTable1690582473213 implements MigrationInterface {
  name = 'updateCompoentLotTable1690582473213';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" DROP CONSTRAINT "FK_040a878c55a37efa00fbb10e196"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" DROP COLUMN "alr_area"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" ADD "alr_area" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" DROP COLUMN "size"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" ADD "size" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" ALTER COLUMN "component_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" ADD CONSTRAINT "FK_040a878c55a37efa00fbb10e196" FOREIGN KEY ("component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" DROP CONSTRAINT "FK_040a878c55a37efa00fbb10e196"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" ALTER COLUMN "component_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" DROP COLUMN "size"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" ADD "size" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" DROP COLUMN "alr_area"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" ADD "alr_area" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" ADD CONSTRAINT "FK_040a878c55a37efa00fbb10e196" FOREIGN KEY ("component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
