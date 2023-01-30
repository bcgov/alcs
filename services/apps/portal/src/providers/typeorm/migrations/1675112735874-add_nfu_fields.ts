import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNfuFields1675112735874 implements MigrationInterface {
  name = 'addNfuFields1675112735874';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_hectares" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_purpose" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_outside_lands" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_agriculture_support" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_will_import_fill" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_total_fill_placement" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_max_fill_depth" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_fill_volume" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_project_duration_years" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_project_duration_months" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_fill_type_description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "nfu_fill_origin_description" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_fill_origin_description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_fill_type_description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_project_duration_months"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_project_duration_years"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_fill_volume"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_max_fill_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_total_fill_placement"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_will_import_fill"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_agriculture_support"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_outside_lands"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_purpose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "nfu_hectares"`,
    );
  }
}
