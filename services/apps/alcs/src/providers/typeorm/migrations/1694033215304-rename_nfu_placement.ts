import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameNfuPlacement1694033215304 implements MigrationInterface {
  name = 'renameNfuPlacement1694033215304';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" RENAME COLUMN "nfu_total_fill_placement" TO "nfu_total_fill_area"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission"."nfu_total_fill_area" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission"."nfu_total_fill_area" IS 'Area for nfu placement of fill'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" RENAME COLUMN "nfu_total_fill_area" TO "nfu_total_fill_placement"`,
    );
  }
}
