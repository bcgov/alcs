import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedDecOutcomes1684450417394 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //Linked Resolution Outcomes
    await queryRunner.query(`
    INSERT INTO "alcs"."linked_resolution_outcome_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Confirm', 'CONF', 'Decision confirms previous resolution'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Reverse', 'REVE', 'Decision reverses the previous resolution'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Vary', 'VARY', 'Decision varies the previous resolution');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
