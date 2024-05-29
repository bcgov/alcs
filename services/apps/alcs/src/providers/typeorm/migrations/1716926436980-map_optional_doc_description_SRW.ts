import { MigrationInterface, QueryRunner } from 'typeorm';

export class MapOptionalDocDescriptionSRW1716926436980
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'oats') THEN
                    WITH alcs_srw_doc_to_update AS (
                    SELECT
                        ad.oats_application_id,
                        ad.oats_document_id
                    FROM
                        alcs.notification_document ad
                    WHERE
                        audit_created_by = 'oats_etl'
                        AND description IS NULL
                    ),
                    srw_doc_description AS (
                    SELECT
                        od.document_id, 
                        od.description
                    FROM
                        oats.oats_documents od
                    JOIN alcs_srw_doc_to_update AS alcs_docs ON
                        alcs_docs.oats_document_id::bigint = od.document_id
                    WHERE
                        od.description IS NOT NULL
                    )
                    UPDATE alcs.notification_document 
                    SET description = COALESCE(srw_doc_description.description, alcs.notification_document.description)
                    FROM srw_doc_description
                    WHERE alcs.notification_document.oats_document_id = srw_doc_description.document_id::TEXT;
                END IF;
            END $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //NONE
  }
}
