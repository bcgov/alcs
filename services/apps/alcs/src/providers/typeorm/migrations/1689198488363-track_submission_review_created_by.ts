import { MigrationInterface, QueryRunner } from 'typeorm';

export class trackSubmissionReviewCreatedBy1689198488363
  implements MigrationInterface
{
  name = 'trackSubmissionReviewCreatedBy1689198488363';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_review" ADD "created_by_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_review" ADD CONSTRAINT "FK_9e40c625d904c15cc05b9a04ff9" FOREIGN KEY ("created_by_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_review" DROP CONSTRAINT "FK_9e40c625d904c15cc05b9a04ff9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_review" DROP COLUMN "created_by_uuid"`,
    );
  }
}
