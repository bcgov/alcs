import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPrDecOutcomes1710278788366 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "alcs"."planning_review_decision_outcome_code"
          ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
          (NULL, NOW(), NULL, 'migration-seed', NULL, 'Endorsed', 'ENDO', 'Endorsed'),
          (NULL, NOW(), NULL, 'migration-seed', NULL, 'Not Endorsed', 'NEND', 'Not Endorsed'),
          (NULL, NOW(), NULL, 'migration-seed', NULL, 'Partially Endorsed', 'PEND', 'Partially Endorsed'),
          (NULL, NOW(), NULL, 'migration-seed', NULL, 'Other', 'OTHR', 'Other');
      `);
  }

  public async down(): Promise<void> {
    //Not needed
  }
}
