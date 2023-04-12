import { MigrationInterface, QueryRunner } from 'typeorm';

export class addProposalNfuFields1680560734288 implements MigrationInterface {
  name = 'addProposalNfuFields1680560734288';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "nfu_use_type" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."nfu_use_type" IS 'Non-farm use type'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "nfu_use_sub_type" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."nfu_use_sub_type" IS 'Non-farm use sub type'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "nfu_end_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."nfu_end_date" IS 'The date at which the non-farm use ends'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "nfu_end_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "nfu_use_sub_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "nfu_use_type"`,
    );
  }
}
