import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedNoticeOfIntentMeetingType1685481264021
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "alcs"."notice_of_intent_meeting_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Information Request', 'IR', 'Information Request');
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // not needed
  }
}
