import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSubdPdfs1713977117461 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "alcs"."document"
      SET "file_name" = CASE
        WHEN "file_name" NOT LIKE '%.pdf' THEN CONCAT("file_name", '.pdf')
        ELSE "file_name"
      END
      WHERE uuid in (SELECT "document_uuid" from "alcs"."application_document" WHERE "type_code" = 'SUBU');
    `);

    await queryRunner.query(`
      UPDATE "alcs"."document"
      SET "file_name" = CASE
        WHEN "file_name" NOT LIKE '%.pdf' THEN CONCAT("file_name", '.pdf')
        ELSE "file_name"
      END
      WHERE uuid in (SELECT "document_uuid" from "alcs"."notice_of_intent_document" WHERE "type_code" = 'SUBU');
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
