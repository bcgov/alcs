import { MigrationInterface, QueryRunner } from 'typeorm';

export class MapOptionalDocDescription1716916423632
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'oats') THEN
                    WITH alcs_application_doc_to_update AS (
                    SELECT
                        ad.oats_application_id,
                        ad.oats_document_id
                    FROM
                        alcs.application_document ad
                    WHERE
                        audit_created_by = 'oats_etl'
                        AND description IS NULL
                    ),
                    application_doc_description AS (
                    SELECT
                        od.document_id, 
                        od.description
                    FROM
                        oats.oats_documents od
                    JOIN alcs_application_doc_to_update AS alcs_docs ON
                        alcs_docs.oats_document_id::bigint = od.document_id
                    WHERE
                        od.description IS NOT NULL
                    )
                    UPDATE alcs.application_document 
                    SET description = COALESCE(application_doc_description.description, alcs.application_document.description)
                    FROM application_doc_description
                    WHERE alcs.application_document.oats_document_id = application_doc_description.document_id::TEXT;
                END IF;
            END $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //NONE
  }
}
