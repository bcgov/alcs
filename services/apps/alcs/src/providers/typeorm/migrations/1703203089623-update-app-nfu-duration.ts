import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAppNfuDuration1703203089623 implements MigrationInterface {
  name = 'UpdateAppNfuDuration1703203089623';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "nfu_project_duration_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "nfu_project_duration_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "nfu_project_duration" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "nfu_project_duration"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "nfu_project_duration_unit" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "nfu_project_duration_amount" numeric(12,2)`,
    );
  }
}
