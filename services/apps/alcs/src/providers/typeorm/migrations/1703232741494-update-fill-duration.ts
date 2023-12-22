import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFillDuration1703232741494 implements MigrationInterface {
  name = 'UpdateFillDuration1703232741494';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "fill_project_duration_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "fill_project_duration_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "fill_project_duration" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "fill_project_duration"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "fill_project_duration_unit" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "fill_project_duration_amount" numeric(12,2)`,
    );
  }
}
