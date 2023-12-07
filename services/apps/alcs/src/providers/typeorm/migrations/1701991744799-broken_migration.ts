import { MigrationInterface, QueryRunner } from 'typeorm';

export class BrokenMigration1701991744799 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SELECT * FROM nonexistingtable`);
  }

  public async down(): Promise<void> {}
}
