import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDocTypes1763605146030 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      update
        alcs.document_code dc
      set
        label = case
          when code = 'CORP' then 'Correspondence'
          when code = 'CAEL' then 'C&E Notice'
          when code = 'CEOO' then 'C&E Order'
          else dc.label
        end;
    `);

    queryRunner.query(`
      insert into
        alcs.document_code (
          audit_created_by,
          label,
          code,
          description,
          oats_code
        )
      values (
        'migration_seed',
        'BC Assessment Report',
        'BCAR',
        'BC Assessment Report',
        'BCAR'
      ),
      (
        'migration_seed',
        'C&E Inspection Report',
        'INSP',
        'C&E Inspection Report',
        'INSP'
      ),
      (
        'migration_seed',
        'Google Earth File',
        'GEFI',
        'Google Earth File',
        'GEFI'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
