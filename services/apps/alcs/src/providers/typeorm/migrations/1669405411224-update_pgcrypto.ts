import { MigrationInterface, QueryRunner } from 'typeorm';

export class updatePgcrypto1669405411224 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER EXTENSION pgcrypto SET SCHEMA public;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // no
  }
}
