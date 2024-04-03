import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCardsForNois1712164553675 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // create backup table
    queryRunner.query(`CREATE TABLE public.backup_noi_with_etl_created_cards (
        file_number TEXT PRIMARY KEY,
        audit_created_by TEXT,
        board_uuid UUID,
        status_code TEXT,
        type_code TEXT);
    `);
    queryRunner.query(
      `COMMENT ON TABLE public.backup_noi_with_etl_created_cards IS 'This is a backup table for NOIs that had cards created by ETL. Delete once confirmed that migration is successful.';`,
    );

    // populate backup table with NOIs that will have cards created for them
    queryRunner.query(`
        INSERT INTO public.backup_noi_with_etl_created_cards (audit_created_by, board_uuid, status_code, type_code, file_number)
        WITH single_status AS 
        (  select       alcs.notice_of_intent_submission_to_submission_status.submission_uuid,
                        MAX(alcs.notice_of_intent_submission_status_type.weight)     as  Max_Status_Weight
            from        alcs.notice_of_intent_submission_to_submission_status
            left join   alcs.notice_of_intent_submission_status_type on  alcs.notice_of_intent_submission_status_type.code = alcs.notice_of_intent_submission_to_submission_status.status_type_code
            where       alcs.notice_of_intent_submission_to_submission_status.effective_date IS NOT NULL 
                    AND alcs.notice_of_intent_submission_status_type.weight >= 1
            group by    alcs.notice_of_intent_submission_to_submission_status.submission_uuid
        ),
        noi_with_card_fields AS (
            select     
                'oats_etl' AS audit_created_by,
                'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2'::uuid AS board_uuid,
                'SUBM' AS status_code,
                'NOI' AS type_code,
                alcs.notice_of_intent.file_number  AS external_ref
            from        alcs.notice_of_intent 
            left join        alcs.application_region                            ON region_code = alcs.application_region.code
            left join        alcs.local_government                              ON alcs.local_government.uuid = alcs.notice_of_intent.local_government_uuid
            left join        alcs.notice_of_intent_type                              ON alcs.notice_of_intent_type.code = alcs.notice_of_intent.type_code
            left join        alcs.notice_of_intent_submission                        ON alcs.notice_of_intent.file_number = alcs.notice_of_intent_submission.file_number
            left join        single_status                                      ON alcs.notice_of_intent_submission.uuid = single_status.submission_uuid
            left join        alcs.notice_of_intent_submission_status_type            ON single_status.Max_Status_Weight = alcs.notice_of_intent_submission_status_type.weight
            where       alcs.notice_of_intent.date_submitted_to_alc IS NOT NULL 
                        and alcs.notice_of_intent.date_submitted_to_alc >= timestamp with time zone '2018-01-01 00:00:00.000Z'
                        AND alcs.notice_of_intent_submission.is_draft = FALSE 
                        and alcs.notice_of_intent_submission_status_type.label <> 'Cancelled'
                        and alcs.notice_of_intent_submission_status_type.label <> 'Decision Released'
                        and alcs.notice_of_intent.card_uuid IS NULL
            order by    alcs.notice_of_intent.file_number
        )
        SELECT * FROM noi_with_card_fields;        
    `);

    // create temp column on cards that links NOI to card
    queryRunner.query(`ALTER TABLE alcs.card ADD COLUMN external_ref TEXT;`);

    // create cards for NOIs
    queryRunner.query(`
        INSERT INTO alcs.card (audit_created_by, board_uuid, status_code, type_code, external_ref)
        SELECT audit_created_by, board_uuid, status_code, type_code, file_number FROM public.backup_noi_with_etl_created_cards;
    `);

    // link cards to NOIs
    queryRunner.query(`
        UPDATE alcs.notice_of_intent 
        SET card_uuid = alcs.card.uuid
        FROM alcs.card 
        WHERE alcs.notice_of_intent.file_number = alcs.card.external_ref AND alcs.card.external_ref IS NOT NULL;
    `);

    // drop temp column
    queryRunner.query(`ALTER TABLE alcs.card DROP COLUMN external_ref;`);
  }

  public async down(): Promise<void> {
    // nope
  }
}
