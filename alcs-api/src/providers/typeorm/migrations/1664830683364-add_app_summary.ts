import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAppSummary1664830683364 implements MigrationInterface {
  name = 'addAppSummary1664830683364';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "application" ADD "summary" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "summary"`);
  }
}
