import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDocumentMimeType1707773296341 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // update etl imported pdf mime_type to application/pdf
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
            WHERE pdf_documents.uuid = alcs."document"."uuid" AND alcs."document".audit_created_by = 'oats_etl';`,
    );
    // update etl imported documents other then pdf to generic mime_type
    await queryRunner.query(`
            WITH documents_with_extensions AS (
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
                file_extension <> 'pdf'
                AND audit_created_by = 'oats_etl'
                )
            UPDATE alcs."document"
            SET mime_type = 'application/octet-stream'
            FROM pdf_documents
            WHERE pdf_documents.uuid = alcs."document"."uuid" AND alcs."document".audit_created_by = 'oats_etl';`);
  }

  public async down(): Promise<void> {
    // no
  }
}
