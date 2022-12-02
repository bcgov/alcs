import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFileKey1662585907909 implements MigrationInterface {
  name = 'addFileKey1662585907909';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document" ADD "file_key" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "file_key"`);
  }
}
