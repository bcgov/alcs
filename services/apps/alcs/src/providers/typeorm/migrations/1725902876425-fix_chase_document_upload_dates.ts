import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixChaseDocumentUploadDates1725902876425
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'oats') THEN
                update  alcs."document" d
                set     uploaded_at = od.uploaded_date at time zone 'America/Vancouver'
                from    alcs.inquiry_document id
                join    oats.oats_documents od on od.document_id::text = id.oats_document_id
                where   id.document_uuid = d."uuid"
                and     id.oats_issue_id in ('50879', '51298', '52731');
        END IF;
        END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // N/A
  }
}
