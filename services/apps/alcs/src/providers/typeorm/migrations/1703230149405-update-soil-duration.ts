import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSoilDuration1703230149405 implements MigrationInterface {
  name = 'UpdateSoilDuration1703230149405';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_project_duration_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_project_duration_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_project_duration" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_project_duration"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_project_duration_unit" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_project_duration_amount" numeric(12,2)`,
    );
  }
}
