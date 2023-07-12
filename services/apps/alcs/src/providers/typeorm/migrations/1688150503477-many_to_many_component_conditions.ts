import { MigrationInterface, QueryRunner } from 'typeorm';

export class manyToManyComponentConditions1688150503477
  implements MigrationInterface
{
  name = 'manyToManyComponentConditions1688150503477';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" DROP CONSTRAINT "FK_a26a88960a996c58891c744beba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" ADD CONSTRAINT "FK_a26a88960a996c58891c744beba" FOREIGN KEY ("application_decision_component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" DROP CONSTRAINT "FK_a26a88960a996c58891c744beba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" ADD CONSTRAINT "FK_a26a88960a996c58891c744beba" FOREIGN KEY ("application_decision_component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
