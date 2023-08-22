import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeDaysHide1692723526069 implements MigrationInterface {
  name = 'removeDaysHide1692723526069';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "days_hide_from_public"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "days_hide_from_public" integer`,
    );
  }
}
