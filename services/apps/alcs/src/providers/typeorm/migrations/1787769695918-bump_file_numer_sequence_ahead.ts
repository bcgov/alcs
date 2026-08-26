import { MigrationInterface, QueryRunner } from 'typeorm';

export class BumpFileNumerSequenceAhead1787769695918 implements MigrationInterface {
  name = 'BumpFileNumerSequenceAhead1787769695918';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      SELECT setval('alcs_file_number_seq', 300000, false)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverting the current state to a lower number after increasing it
    // is not safe, because it would eventually lead to conflicts. New files
    // would start throwing unique constraint violations errors.
  }
}
