import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPrMeetingTypes1710870743180 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."planning_review_meeting_type"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration-seed', NULL, 'Discussion', 'DISC', 'Discussion'),
        (NULL, NOW(), NULL, 'migration-seed', NULL, 'Site Visit', 'SITE', 'Site Visit'),
        (NULL, NOW(), NULL, 'migration-seed', NULL, 'L/FNG Presentation', 'LFNG', 'L/FNG Presentation'),
        (NULL, NOW(), NULL, 'migration-seed', NULL, 'L/FNG Presentation & Discussion', 'LFNP', 'L/FNG Presentation & Discussion');
    `);
  }

  public async down(): Promise<void> {
    //Not needed for seeds
  }
}
