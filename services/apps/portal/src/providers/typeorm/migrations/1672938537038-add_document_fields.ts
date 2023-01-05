import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDocumentFields1672938537038 implements MigrationInterface {
  name = 'addDocumentFields1672938537038';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ADD "file_name" character varying NOT NULL DEFAULT 'file'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ADD "file_size" integer NOT NULL DEFAULT 0`,
    );

    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ALTER COLUMN "file_name" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ALTER COLUMN "file_size" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" DROP COLUMN "file_size"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" DROP COLUMN "file_name"`,
    );
  }
}
