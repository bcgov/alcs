import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTypoInSubdivisionPill1713979497284
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        UPDATE alcs.application_type 
        SET "label" = 'Subdivision'
        WHERE "code" = 'SUBD';
    `);
  }

  public async down(): Promise<void> {
    // no
  }
}
