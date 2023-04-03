import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameAlcsSource1680551989646 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "alcs"."document" SET "source"='ALC' WHERE "source"='ALCS'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ALTER COLUMN "source" SET DEFAULT 'ALC'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //Nope
  }
}
