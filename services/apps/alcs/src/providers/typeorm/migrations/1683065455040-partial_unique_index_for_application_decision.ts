import { MigrationInterface, QueryRunner } from 'typeorm';

export class partialUniqueIndexForApplicationDecision1683065455040
  implements MigrationInterface
{
  name = 'partialUniqueIndexForApplicationDecision1683065455040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "rescinded_comment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "rescinded_comment" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."rescinded_comment" IS 'Comment provided by the staff when the decision was rescinded'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_9fd353dcf19ea98d0de8ff8be9" ON "alcs"."application_decision" ("resolution_number", "resolution_year") WHERE "audit_deleted_date_at" is null and "resolution_number" is not null`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_9fd353dcf19ea98d0de8ff8be9"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."rescinded_comment" IS 'Comment provided by the staff when the decision was rescinded'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "rescinded_comment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "rescinded_comment" character varying`,
    );
  }
}
