import { MigrationInterface, QueryRunner } from 'typeorm';

export class soilDecisionComponentTypes1686853355705
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        INSERT INTO alcs.application_decision_component_type 
            (audit_deleted_date_at, audit_created_at, audit_updated_at, audit_created_by, audit_updated_by, "label", code, description) 
        values 
            (null , now(), now(), 'seed-migration','seed-migration' , 'Placement of Fill', 'POFO', 'Placement of Fill'),
            (null , now(), now(), 'seed-migration','seed-migration' , 'Removal of Soil', 'ROSO', 'Removal of Soil'),
            (null , now(), now(), 'seed-migration','seed-migration' , 'Placement of Fill/Removal of Soil', 'PFRS', 'Placement of Fill/Removal of Soil');
        `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
