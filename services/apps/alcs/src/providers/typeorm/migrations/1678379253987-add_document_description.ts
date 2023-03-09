import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDocumentDescription1678379253987 implements MigrationInterface {
  name = 'addDocumentDescription1678379253987';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ADD "description" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" DROP COLUMN "description"`,
    );
  }
}
