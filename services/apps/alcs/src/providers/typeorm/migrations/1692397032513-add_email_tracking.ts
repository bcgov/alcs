import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEmailTracking1692397032513 implements MigrationInterface {
  name = 'addEmailTracking1692397032513';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."email_status" ADD "parent_type" character varying`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."email_status"."parent_type" IS 'Type of parent entity'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."email_status" ADD "parent_id" character varying`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."email_status"."parent_id" IS 'Uuid of parent entity'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."email_status" ADD "trigger_status" character varying`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."email_status"."trigger_status" IS 'Status that triggered the email'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."email_status"."trigger_status" IS 'Status that triggered the email'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."email_status" DROP COLUMN "trigger_status"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."email_status"."parent_id" IS 'Uuid of parent entity'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."email_status" DROP COLUMN "parent_id"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."email_status"."parent_type" IS 'Type of parent entity'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."email_status" DROP COLUMN "parent_type"`,
    );
  }
}
