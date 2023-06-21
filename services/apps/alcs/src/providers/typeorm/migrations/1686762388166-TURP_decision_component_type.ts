import { MigrationInterface, QueryRunner } from 'typeorm';

export class TURPDecisionComponentType1686762388166
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
            INSERT INTO alcs.application_decision_component_type
      (audit_deleted_date_at, audit_created_at, audit_updated_at, audit_created_by, audit_updated_by, "label", code, description)
      values (null , now(), now(), 'seed-migration','seed-migration' , 'Transportation, Utility, and Recreational Trail', 'TURP', 'Transportation, Utility, and Recreational Trail');
            `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
