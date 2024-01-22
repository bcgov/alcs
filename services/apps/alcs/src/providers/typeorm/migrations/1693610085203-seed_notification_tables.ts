import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedNotificationTables1693610085203 implements MigrationInterface {
  name = 'seedNotificationTables1693610085203';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."notification_type"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "short_label", "html_description", "portal_label") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Statutory Right of Way', 'SRW', 'Statutory Right of Way', 'SRW', 'TODO', 'Statutory Right of Way');
    `);
  }

  public async down(): Promise<void> {
    //Nope
  }
}
