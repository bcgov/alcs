import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAppProjectDuration1703232741494
  implements MigrationInterface
{
  name = 'UpdateAppProjectDuration1703232741494';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_project_duration_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_project_duration_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_project_duration" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "nfu_project_duration_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "nfu_project_duration_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "nfu_project_duration" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_project_duration_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_project_duration_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_project_duration" text`,
    );
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
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_project_duration"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_project_duration_unit" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_project_duration_amount" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "nfu_project_duration"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "nfu_project_duration_unit" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "nfu_project_duration_amount" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_project_duration"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_project_duration_unit" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_project_duration_amount" numeric(12,2)`,
    );
  }
}
