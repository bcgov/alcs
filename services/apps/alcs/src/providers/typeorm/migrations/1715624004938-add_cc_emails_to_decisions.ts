import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCcEmailsToDecisions1715624004938 implements MigrationInterface {
  name = 'AddCcEmailsToDecisions1715624004938';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "cc_emails" text array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."cc_emails" IS 'Tracks extra emails to send the decision email to'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD "cc_emails" text array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."cc_emails" IS 'Tracks extra emails to send the decision email to'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "cc_emails"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "cc_emails"`,
    );
  }
}
