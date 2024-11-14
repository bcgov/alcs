import { MigrationInterface, QueryRunner } from 'typeorm';

export class AnswerNoToStructuresForOldSoilApps1731100639156 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      update
        alcs.application_submission as2
      set
        soil_is_new_structure = false
      where
        as2.type_code in ('PFRS', 'POFO', 'ROSO')
        and as2.soil_is_new_structure is null;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
