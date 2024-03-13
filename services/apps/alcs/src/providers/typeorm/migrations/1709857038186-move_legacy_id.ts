import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveLegacyId1709857038186 implements MigrationInterface {
  name = 'MoveLegacyId1709857038186';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_referral" DROP COLUMN "legacy_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD "legacy_id" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."planning_review"."legacy_id" IS 'Application Id that is applicable only to paper version applications from 70s - 80s'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."planning_review"."legacy_id" IS 'Application Id that is applicable only to paper version applications from 70s - 80s'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP COLUMN "legacy_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_referral" ADD "legacy_id" text`,
    );
  }
}
