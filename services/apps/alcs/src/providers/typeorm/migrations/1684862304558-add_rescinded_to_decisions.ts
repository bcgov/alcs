import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRescindedToDecisions1684862304558
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."decision_outcome_code" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "is_first_decision") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Rescinded', 'RESC', 'Decision was released but is now rescinded', false);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //No
  }
}
