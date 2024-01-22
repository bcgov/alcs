import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedNoiSubmissionStatus1691535272576
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."notice_of_intent_submission_status_type" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "weight", "alcs_background_color", "alcs_color", "portal_background_color", "portal_color") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Decision Released', 'ALCD', 'First decision released', 5, '#94c6ac', '#002f17', '#94c6ac', '#002f17'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Cancelled', 'CANC', 'Notice of Intent has been cancelled', 4, '#efefef', '#565656', '#efefef', '#565656'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'In Progress', 'PROG', 'Notice of Intent is in progress and has not been submitted', 0, '#fee9b5', '#313132', '#acd2ed', '#0c2e46'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Received By ALC', 'RECA', 'Notice of Intent received Date Received All Items', 3, '#94c6ac', '#002f17', '#acd2ed', '#0c2e46'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Submitted to ALC', 'SUBM', 'Notice of Intent has been submitted', 1, '#94c6ac', '#002f17', '#94c6ac', '#002f17'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Submitted to ALC - Incomplete', 'SUIN', 'Notice of Intent received Acknowledge Incomplete Date', 2, '#94c6ac', '#002f17', '#f8c0a3', '#83360d');
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
