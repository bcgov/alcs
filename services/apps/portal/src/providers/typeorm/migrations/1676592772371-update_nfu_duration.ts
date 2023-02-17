import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateNfuDuration1676592772371 implements MigrationInterface {
  name = 'updateNfuDuration1676592772371';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_project_duration_months"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_project_duration_years"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_project_duration_amount" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_project_duration_unit" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_hectares"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_hectares" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_total_fill_placement"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_total_fill_placement" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_max_fill_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_max_fill_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_fill_volume"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_fill_volume" numeric(12,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_fill_volume"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_fill_volume" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_max_fill_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_max_fill_depth" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_total_fill_placement"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_total_fill_placement" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_hectares"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_hectares" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_project_duration_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_project_duration_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_project_duration_years" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_project_duration_months" integer`,
    );
  }
}
