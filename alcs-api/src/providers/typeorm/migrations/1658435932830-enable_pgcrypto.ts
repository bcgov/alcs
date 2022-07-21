import { MigrationInterface, QueryRunner } from 'typeorm';

export class enablePgcrypto1658435932830 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION pgcrypto`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    console.log('Nothing to revert in enablePgcrypto1658435932830');
  }
}
