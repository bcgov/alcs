import { MigrationInterface, QueryRunner } from 'typeorm';

export class emailSentInStatusTable1694195607654 implements MigrationInterface {
  name = 'emailSentInStatusTable1694195607654';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_to_submission_status" ADD "email_sent_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission_to_submission_status"."email_sent_date" IS 'Applicable only for "REVA" (Under Review by ALC) and ALCD("Decision released") statuses all others always set to null'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission_to_submission_status"."email_sent_date" IS 'Applicable only for "REVA" (Under Review by ALC) and ALCD("Decision released") statuses all others always set to null'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_to_submission_status" DROP COLUMN "email_sent_date"`,
    );
  }
}
