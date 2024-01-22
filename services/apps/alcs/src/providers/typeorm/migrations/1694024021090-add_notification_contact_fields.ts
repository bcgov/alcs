import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNotificationContactFields1694024021090
  implements MigrationInterface
{
  name = 'addNotificationContactFields1694024021090';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" ADD "contact_first_name" character varying`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_submission"."contact_first_name" IS 'Primary Contacts First Name'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" ADD "contact_last_name" character varying`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_submission"."contact_last_name" IS 'Primary Contacts Last Name'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" ADD "contact_organization" character varying`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_submission"."contact_organization" IS 'Primary Contacts Organization Name'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" ADD "contact_phone" character varying`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_submission"."contact_phone" IS 'Primary Contacts Phone'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" ADD "contact_email" character varying`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_submission"."contact_email" IS 'Primary Contacts Email'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" DROP COLUMN "contact_email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" DROP COLUMN "contact_phone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" DROP COLUMN "contact_organization"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" DROP COLUMN "contact_last_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" DROP COLUMN "contact_first_name"`,
    );
  }
}
