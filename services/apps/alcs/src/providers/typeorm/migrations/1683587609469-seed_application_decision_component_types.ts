import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedApplicationDecisionComponentTypes1683587609469
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      INSERT INTO alcs.application_decision_component_type
(audit_deleted_date_at, audit_created_at, audit_updated_at, audit_created_by, audit_updated_by, "label", code, description)
values (null , now(), now(), 'seed-migration','seed-migration' , 'Non-Farm Use', 'NFUP', 'Non-Farm Use');
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nah
  }
}
