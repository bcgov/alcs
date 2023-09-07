import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNotificationTableComments1694106690840
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification" IS 'Stores Notification Class Applications such as SRWs'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_parcel" IS 'Parcels Related to Notification Applications'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_transferee" IS 'The Transferees related to Notification Applications'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_submission" IS 'Portal Submissions for Notifications'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_submission_status_type" IS 'Statuses for Notification Submissions'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_submission_to_submission_status" IS 'Links Notifications to their Statuses with Dates'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_document" IS 'Documents for Notifications'`,
    );
  }

  public async down(): Promise<void> {
    //No
  }
}
