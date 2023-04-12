import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAgCapFields1680545553592 implements MigrationInterface {
  name = 'addAgCapFields1680545553592';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "alr_area" numeric(12,2)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."alr_area" IS 'Area in hectares of ALR impacted by the proposal'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "ag_cap" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."ag_cap" IS 'Agricultural cap classification'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "ag_cap_source" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."ag_cap_source" IS 'Agricultural capability classification system used'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "ag_cap_map" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."ag_cap_map" IS 'Agricultural capability map sheet reference'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "ag_cap_consultant" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."ag_cap_consultant" IS 'Consultant who determined the agricultural capability'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "ag_cap_consultant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "ag_cap_map"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "ag_cap_source"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "ag_cap"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "alr_area"`,
    );
  }
}
