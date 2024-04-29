import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCardsForApplications1712159113804
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // create backup table
    queryRunner.query(`CREATE TABLE public.backup_application_with_etl_created_cards (
        file_number TEXT PRIMARY KEY,
        audit_created_by TEXT,
        board_uuid UUID,
        status_code TEXT,
        type_code TEXT);
    `);
    queryRunner.query(
      `COMMENT ON TABLE public.backup_application_with_etl_created_cards IS 'This is a backup table for applications that had cards created by ETL. Delete once confirmed that migration is successful.';`,
    );

    // populate backup table with applications that will have cards created for them
    queryRunner.query(`
        INSERT INTO public.backup_application_with_etl_created_cards (audit_created_by, board_uuid, status_code, type_code, file_number)
        WITH single_status AS 
        (  select       alcs.application_submission_to_submission_status.submission_uuid,
                        MAX(alcs.application_submission_status_type.weight)     as  Max_Status_Weight
            from        alcs.application_submission_to_submission_status
            left join   alcs.application_submission_status_type on  alcs.application_submission_status_type.code = alcs.application_submission_to_submission_status.status_type_code
            where       alcs.application_submission_to_submission_status.effective_date IS NOT NULL 
                    AND alcs.application_submission_status_type.weight >= 5
            group by    alcs.application_submission_to_submission_status.submission_uuid
        ),
        application_with_card_fields AS (
        select      
            'oats_etl' AS audit_created_by, -- default etl user
            'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2'::uuid AS board_uuid, -- vetting board
            'SUBM' AS status_code, -- first column of vetting board
            'APP' AS type_code, -- application type
            alcs.application.file_number  AS external_ref -- this is required to 
                
        from             alcs.application 
        left join        alcs.application_region                            ON region_code = alcs.application_region.code
        left join        alcs.local_government                              ON alcs.local_government.uuid = alcs.application.local_government_uuid
        left join        alcs.application_type                              ON alcs.application_type.code = alcs.application.type_code
        left join        alcs.application_submission                        ON alcs.application.file_number = alcs.application_submission.file_number
        left join        single_status                                      ON alcs.application_submission.uuid = single_status.submission_uuid
        left join        alcs.application_submission_status_type            ON single_status.Max_Status_Weight = alcs.application_submission_status_type.weight
        where       alcs.application.date_submitted_to_alc IS NOT NULL 
                    and alcs.application.date_submitted_to_alc >= timestamp with time zone '2020-01-01 00:00:00.000Z'
                    AND alcs.application_submission.is_draft = FALSE            and alcs.application_submission_status_type.label <> 'Cancelled'
                    and alcs.application_submission_status_type.label <> 'Decision Released'
                    and alcs.application.card_uuid IS NULL
        order by    alcs.application.file_number)
        SELECT * FROM application_with_card_fields;
    `);

    // create temp column on cards that links application to card
    queryRunner.query(`ALTER TABLE alcs.card ADD COLUMN external_ref TEXT;`);

    // create cards for applications
    queryRunner.query(`
        INSERT INTO alcs.card (audit_created_by, board_uuid, status_code, type_code, external_ref)
        SELECT audit_created_by, board_uuid, status_code, type_code, file_number FROM public.backup_application_with_etl_created_cards;
    `);

    // link cards to applications
    queryRunner.query(`
        UPDATE alcs.application 
        SET card_uuid = alcs.card.uuid
        FROM alcs.card 
        WHERE alcs.application.file_number = alcs.card.external_ref AND alcs.card.external_ref IS NOT NULL;
    `);

    // drop temp column
    queryRunner.query(`ALTER TABLE alcs.card DROP COLUMN external_ref;`);
  }

  public async down(): Promise<void> {
    // nope
  }
}
