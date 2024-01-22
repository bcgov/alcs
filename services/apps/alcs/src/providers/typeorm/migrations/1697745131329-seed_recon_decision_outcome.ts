import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedReconDecisionOutcome1697745131329
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."application_reconsideration_outcome_type" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Confirm', 'CONF', 'Confirm'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Reverse', 'REVE', 'Reverse'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Vary', 'VARY', 'Vary');
      `);
  }

  public async down(): Promise<void> {
    //Nope
  }
}
