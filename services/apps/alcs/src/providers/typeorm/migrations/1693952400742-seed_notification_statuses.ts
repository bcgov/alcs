import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedNotificationStatuses1693952400742
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."notification_submission_status_type" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "weight", "alcs_background_color", "alcs_color", "portal_background_color", "portal_color") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'ALC Response Sent', 'ALCR', 'Response sent to applicant', 3, '#94c6ac', '#002f17', '#94c6ac', '#002f17'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Cancelled', 'CANC', 'Notification has been cancelled', 2, '#efefef', '#565656', '#efefef', '#565656'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'In Progress', 'PROG', 'Notification is in progress and has not been submitted', 0, '#fee9b5', '#313132', '#acd2ed', '#0c2e46'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Submitted to ALC', 'SUBM', 'Notification has been submitted', 1, '#94c6ac', '#002f17', '#94c6ac', '#002f17');
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
