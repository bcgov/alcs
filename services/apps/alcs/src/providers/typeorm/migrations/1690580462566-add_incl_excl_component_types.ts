import { MigrationInterface, QueryRunner } from 'typeorm';

export class addInclExclComponentTypes1690580462566
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        INSERT INTO alcs.application_decision_component_type 
            (audit_deleted_date_at, audit_created_at, audit_updated_at, audit_created_by, audit_updated_by, "label", code, description) 
        values 
            (null , now(), now(), 'seed-migration','seed-migration' , 'Inclusion', 'INCL', 'Inclusion'),
            (null , now(), now(), 'seed-migration','seed-migration' , 'Exclusion', 'EXCL', 'Exclusion');
        `,
    );
  }

  public async down(): Promise<void> {
    //No
  }
}
