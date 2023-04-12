import { MigrationInterface, QueryRunner } from 'typeorm';

export class linkReviewToApplication1679677365694
  implements MigrationInterface
{
  name = 'linkReviewToApplication1679677365694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_review" DROP CONSTRAINT "FK_e7960826434a224230f23680d7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "application_review"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_review" ADD CONSTRAINT "FK_e7960826434a224230f23680d7a" FOREIGN KEY ("application_file_number") REFERENCES "alcs"."application"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_review" DROP CONSTRAINT "FK_e7960826434a224230f23680d7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "application_review" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_review" ADD CONSTRAINT "FK_e7960826434a224230f23680d7a" FOREIGN KEY ("application_file_number") REFERENCES "alcs"."application_submission"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
