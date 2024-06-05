import { MigrationInterface, QueryRunner } from 'typeorm';

export class IncreaseDecimalPointsForNoiComponent1717088700859
  implements MigrationInterface
{
  name = 'IncreaseDecimalPointsForNoiComponent1717088700859';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_component" ALTER COLUMN "alr_area" TYPE numeric(12,5)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_component" ALTER COLUMN "alr_area" TYPE numeric(12,2)`,
    );
  }
}
