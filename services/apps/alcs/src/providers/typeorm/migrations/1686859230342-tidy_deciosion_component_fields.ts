import { MigrationInterface, QueryRunner } from 'typeorm';

export class tidyDeciosionComponentFields1686859230342
  implements MigrationInterface
{
  name = 'tidyDeciosionComponentFields1686859230342';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "expiry_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_component"."expiry_date" IS 'Components\` expiry date'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_component"."expiry_date" IS 'Components\` expiry date'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "expiry_date"`,
    );
  }
}
