import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDocVisbility1680026529245 implements MigrationInterface {
  name = 'addDocVisbility1680026529245';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ADD "visibility_flags" text array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_document" SET "visibility_flags"='{C}' WHERE type_code='OTHR'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" DROP COLUMN "visibility_flags"`,
    );
  }
}
