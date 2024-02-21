import { MigrationInterface, QueryRunner } from 'typeorm';

export class Cleanups1708556302044 implements MigrationInterface {
  name = 'Cleanups1708556302044';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_39c4f5ceb0f5a7a4c819d46a0d"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."created_at" IS 'The date at which the noi was created in OATS'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4776c7dcd306a47a372b322fd9" ON "alcs"."application_submission" ("file_number") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_4776c7dcd306a47a372b322fd9"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."created_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_39c4f5ceb0f5a7a4c819d46a0d" ON "alcs"."application" ("file_number") `,
    );
  }
}
