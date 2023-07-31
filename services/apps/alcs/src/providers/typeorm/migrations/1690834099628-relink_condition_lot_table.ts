import { MigrationInterface, QueryRunner } from 'typeorm';

export class relinkConditionLotTable1690834099628
  implements MigrationInterface
{
  name = 'relinkConditionLotTable1690834099628';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_to_component_lot" DROP CONSTRAINT "FK_c41ec91b3f32c215e495770a2e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_to_component_lot" ADD CONSTRAINT "FK_c41ec91b3f32c215e495770a2e1" FOREIGN KEY ("component_lot_uuid") REFERENCES "alcs"."application_decision_component_lot"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_to_component_lot" DROP CONSTRAINT "FK_c41ec91b3f32c215e495770a2e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_to_component_lot" ADD CONSTRAINT "FK_c41ec91b3f32c215e495770a2e1" FOREIGN KEY ("component_lot_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
