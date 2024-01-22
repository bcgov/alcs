import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCoveDecisionComponent1698776304748
  implements MigrationInterface
{
  name = 'addCoveDecisionComponent1698776304748';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."application_decision_component_type"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'seed-migration', 'seed-migration', 'Restrictive Covenant', 'COVE', 'Restrictive Covenant');  
    `);
  }

  public async down(): Promise<void> {
    //Nope
  }
}
