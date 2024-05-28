import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixMimeTypesForFiles1715274839125 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `WITH documents_with_extensions AS (
        SELECT 
        trim(lower(SUBSTRING(file_name FROM '\.([^\.]*)$'))) AS file_extension,
        *     
        FROM
            alcs."document" d 
            ),
            pdf_documents AS (
        SELECT
            *
        FROM
            documents_with_extensions
        WHERE
            file_extension = 'pdf'
            )
        UPDATE alcs."document"
        SET mime_type = 'application/pdf'
        FROM pdf_documents
        WHERE pdf_documents.uuid = alcs."document"."uuid" AND alcs."document".mime_type <> 'application/pdf';`,
    );
  }

  public async down(): Promise<void> {
    // no
  }
}
