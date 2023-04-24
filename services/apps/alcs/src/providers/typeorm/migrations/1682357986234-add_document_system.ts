import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDocumentSystem1682357986234 implements MigrationInterface {
  name = 'addDocumentSystem1682357986234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ADD "system" character varying NOT NULL DEFAULT 'ALCS'`,
    );

    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."document"."system" IS 'Front-end the document was uploaded from'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" DROP COLUMN "system"`,
    );
  }
}
