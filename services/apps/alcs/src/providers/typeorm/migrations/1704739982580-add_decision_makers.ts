import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDecisionMakers1704739982580 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."application_decision_maker_code"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "is_active") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'BC Government', 'BCGO', 'BC Government', 't'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'BC Energy Regulator (formally OGC)', 'BCER', 'BC Energy Regulator (formally OGC)', 't'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Local Government (Historical)', 'LGOV', 'Local Government (Historical)', 't'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Agricultural Land Commission', 'ALCS', 'Agricultural Land Commission', 't');
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
