import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailSentForDecisions1715276586900
  implements MigrationInterface
{
  name = 'AddEmailSentForDecisions1715276586900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "email_sent" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."email_sent" IS 'Used to track if/when the email was sent for this decision'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD "email_sent" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."email_sent" IS 'Used to track if/when the email was sent for this decision'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_decision" set "email_sent" = NOW() WHERE "date" <= NOW() AND "is_draft" = FALSE`, //Assume existing job has handled them up until today
    );
    await queryRunner.query(
      `UPDATE "alcs"."notice_of_intent_decision" set "email_sent" = NOW() WHERE "date" <= NOW() AND "is_draft" = FALSE`, //Assume existing job has handled them up until today
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "email_sent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "email_sent"`,
    );
  }
}
