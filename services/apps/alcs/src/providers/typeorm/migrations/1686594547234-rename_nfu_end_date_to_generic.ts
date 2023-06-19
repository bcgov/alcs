import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameNfuEndDateToGeneric1686594547234
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "alcs"."application" RENAME COLUMN "nfu_end_date" to "proposal_end_date"
    `);
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."proposal_end_date" IS 'The date at which the proposal use ends'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "alcs"."application" RENAME COLUMN "proposal_end_date" to "nfu_end_date"
    `);
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."proposal_end_date" IS 'The date at which the non-farm use ends'`,
    );
  }
}
