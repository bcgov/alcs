import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedNoiModificationOutcomes1685989862831
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."notice_of_intent_modification_outcome_type"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Pending', 'PEN', 'Pending'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Proceed to Modify', 'PRC', 'Proceed'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Refuse to Modify', 'REF', 'Refuse'); 
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
