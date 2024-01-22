import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAgCapColumnsToNoi1692314042619 implements MigrationInterface {
  name = 'addAgCapColumnsToNoi1692314042619';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "alr_area" numeric(12,2)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."alr_area" IS 'Area in hectares of ALR impacted by the proposal'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "ag_cap" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."ag_cap" IS 'Agricultural cap classification'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "ag_cap_source" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."ag_cap_source" IS 'Agricultural capability classification system used'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "ag_cap_map" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."ag_cap_map" IS 'Agricultural capability map sheet reference'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "ag_cap_consultant" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."ag_cap_consultant" IS 'Consultant who determined the agricultural capability'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "staff_observations" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."staff_observations" IS 'ALC Staff Observations and Comments'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."staff_observations" IS 'ALC Staff Observations and Comments'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "staff_observations"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."ag_cap_consultant" IS 'Consultant who determined the agricultural capability'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "ag_cap_consultant"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."ag_cap_map" IS 'Agricultural capability map sheet reference'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "ag_cap_map"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."ag_cap_source" IS 'Agricultural capability classification system used'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "ag_cap_source"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."ag_cap" IS 'Agricultural cap classification'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "ag_cap"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."alr_area" IS 'Area in hectares of ALR impacted by the proposal'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "alr_area"`,
    );
  }
}
