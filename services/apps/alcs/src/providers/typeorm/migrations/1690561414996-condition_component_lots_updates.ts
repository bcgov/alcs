import { MigrationInterface, QueryRunner } from 'typeorm';

export class conditionComponentLotsUpdates1690561414996
  implements MigrationInterface
{
  name = 'conditionComponentLotsUpdates1690561414996';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" DROP CONSTRAINT "FK_040a878c55a37efa00fbb10e196"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" DROP CONSTRAINT "REL_040a878c55a37efa00fbb10e19"`,
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
      `ALTER TABLE "alcs"."application_decision_component_lot" ADD CONSTRAINT "REL_040a878c55a37efa00fbb10e19" UNIQUE ("component_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" ADD CONSTRAINT "FK_040a878c55a37efa00fbb10e196" FOREIGN KEY ("component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
