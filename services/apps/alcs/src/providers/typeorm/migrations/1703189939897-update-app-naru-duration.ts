import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAppNaruDuration1703189939897 implements MigrationInterface {
  name = 'UpdateAppNaruDuration1703189939897';

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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
