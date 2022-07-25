import { MigrationInterface, QueryRunner } from 'typeorm';

export class enablePgcrypto1658435932830 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
  }

  public async down(): Promise<void> {
    console.log('Nothing to revert in enablePgcrypto1658435932830');
  }
}
