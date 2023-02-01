import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDocumentDescription1675194109442 implements MigrationInterface {
  name = 'addDocumentDescription1675194109442';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ADD "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ALTER COLUMN "type" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ALTER COLUMN "type" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" DROP COLUMN "description"`,
    );
  }
}
