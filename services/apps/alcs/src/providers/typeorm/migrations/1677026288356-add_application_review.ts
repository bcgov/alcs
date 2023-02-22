import { MigrationInterface, QueryRunner } from 'typeorm';

export class addApplicationReview1677026288356 implements MigrationInterface {
  name = 'addApplicationReview1677026288356';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "application_review" jsonb`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."application_review" IS 'JSONB Column containing the government / first nation government review from the Portal'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."application_review" IS 'JSONB Column containing the government / first nation government review from the Portal'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "application_review"`,
    );
  }
}
