import { MigrationInterface, QueryRunner } from 'typeorm';

export class emailSentInNoiSubmissionStatusTable1694214288431
  implements MigrationInterface
{
  name = 'emailSentInNoiSubmissionStatusTable1694214288431';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission_to_submission_status" ADD "email_sent_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_submission_to_submission_status"."email_sent_date" IS 'Applicable only for ALCD("Decision released") status all others always set to null'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_submission_to_submission_status"."email_sent_date" IS 'Applicable only for ALCD("Decision released") status all others always set to null'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission_to_submission_status" DROP COLUMN "email_sent_date"`,
    );
  }
}
