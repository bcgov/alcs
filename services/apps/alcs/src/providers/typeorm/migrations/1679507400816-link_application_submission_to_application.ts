import { MigrationInterface, QueryRunner } from 'typeorm';

export class linkApplicationSubmissionToApplication1679507400816
  implements MigrationInterface
{
  name = 'linkApplicationSubmissionToApplication1679507400816';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."application_submission_review"`,
    );
    await queryRunner.query(
      `DELETE FROM "alcs"."application_parcel_owners_application_owner"`,
    );
    await queryRunner.query(`DELETE FROM "alcs"."application_owner"`);
    await queryRunner.query(`DELETE FROM "alcs"."application_parcel"`);
    await queryRunner.query(`DELETE FROM "alcs"."application_submission"`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "submitted_application"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" DROP CONSTRAINT "FK_83717f1d73931fd18e810c03aa7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP CONSTRAINT "FK_803e574fe048adacb88443c8d45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP CONSTRAINT "FK_8104e51d0d9d1e920cd0f6df17c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_review" DROP CONSTRAINT "FK_e7960826434a224230f23680d7a"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission"."file_number" IS 'File Number of attached application'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD CONSTRAINT "UQ_4776c7dcd306a47a372b322fd9b" UNIQUE ("file_number")`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD CONSTRAINT "FK_803e574fe048adacb88443c8d45" FOREIGN KEY ("application_file_number") REFERENCES "alcs"."application_submission"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD CONSTRAINT "FK_8104e51d0d9d1e920cd0f6df17c" FOREIGN KEY ("application_file_number") REFERENCES "alcs"."application_submission"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD CONSTRAINT "FK_4776c7dcd306a47a372b322fd9b" FOREIGN KEY ("file_number") REFERENCES "alcs"."application"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" ADD CONSTRAINT "FK_83717f1d73931fd18e810c03aa7" FOREIGN KEY ("document_uuid") REFERENCES "alcs"."document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_review" ADD CONSTRAINT "FK_e7960826434a224230f23680d7a" FOREIGN KEY ("application_file_number") REFERENCES "alcs"."application_submission"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
