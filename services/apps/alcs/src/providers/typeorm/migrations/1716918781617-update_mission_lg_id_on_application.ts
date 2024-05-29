import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMissionLgIdOnApplication1716918781617
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const submissionSelectCteQuery = `WITH alcs_submissions AS (
        SELECT      alcs.application.file_number::bigint
                    , alcs.application_submission.uuid AS "submission_uuid"
                    , alcs.application_submission_status_type.label
                    , alcs.application_submission_status_type.code
                    , alcs.application_submission_to_submission_status.effective_date
                    , alcs.application_submission.audit_created_by
                    , alcs.application_submission.local_government_uuid
        FROM        alcs.application
        JOIN        alcs.application_submission ON alcs.application.file_number = alcs.application_submission.file_number AND alcs.application_submission.is_draft = FALSE
        JOIN        alcs.application_submission_to_submission_status ON alcs.application_submission_to_submission_status.submission_uuid = alcs.application_submission.uuid
        JOIN        alcs.application_submission_status_type ON  alcs.application_submission_status_type.code = alcs.application_submission_to_submission_status.status_type_code
        WHERE       alcs.application_submission_status_type.code = 'SUBG'
                AND alcs.application_submission_to_submission_status.effective_date IS NOT NULL
                AND alcs.application.local_government_uuid IS NULL
        order by    alcs.application.file_number::bigint
        ),
        oats_gov AS (
                SELECT
                    oaap.alr_application_id AS application_id,
                    oo.organization_name AS oats_gov_name
                FROM
                    oats.oats_alr_application_parties oaap
                    JOIN oats.oats_person_organizations opo ON oaap.person_organization_id = opo.person_organization_id
                    JOIN oats.oats_organizations oo ON opo.organization_id = oo.organization_id
                WHERE
                    oo.organization_type_cd IN ('MUNI','FN','RD','RM')
            )
        , local_gov_uuid_to_set AS (
            SELECT alcs_submissions.*, lg.uuid AS lg_uuid, oats_gov.oats_gov_name  FROM alcs_submissions
            JOIN oats_gov ON oats_gov.application_id = alcs_submissions.file_number
            LEFT JOIN alcs.local_government lg  ON TRIM(BOTH FROM LOWER(lg.name)) = TRIM(BOTH FROM LOWER(oats_gov.oats_gov_name))
            WHERE lg.uuid IS NOT NULL
        )`;

    const applicationCteQuery = `
        WITH applications_to_update AS (
            SELECT a.uuid, a.local_government_uuid AS "application_lg_uuid", as2.local_government_uuid 
            FROM alcs.application a
            JOIN alcs.application_submission as2 ON a.file_number = as2.file_number AND as2.is_draft = FALSE AND as2.audit_created_by = 'oats_etl' 
            WHERE 
                a.local_government_uuid IS NULL 
                AND as2.local_government_uuid IS NOT NULL 
        )`;

    await queryRunner.query(`
        DO $$
        BEGIN
            -- backup source data
            IF EXISTS (SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'oats') THEN
                CREATE TABLE IF NOT EXISTS public.backup_set_missing_lg_on_application_submission (
                    alcs_submission_uuid UUID NOT NULL,
                    alcs_submission_file_number TEXT NOT NULL,
                    alcs_source_lg_uuid UUID,
                    alcs_desired_lg_uuid UUID,
                    oats_lg_name TEXT NOT NULL,
                    PRIMARY KEY (alcs_submission_uuid)
                );

                COMMENT ON TABLE public.backup_set_missing_lg_on_application_submission IS 'This is a backup table for Application Submission LFNG UUID. Delete once confirmed that migration is successful.';

                INSERT INTO public.backup_set_missing_lg_on_application_submission (alcs_submission_uuid, alcs_submission_file_number, alcs_source_lg_uuid, alcs_desired_lg_uuid, oats_lg_name)
                ${submissionSelectCteQuery}
                SELECT submission_uuid, file_number::text, local_government_uuid, lg_uuid, oats_gov_name FROM local_gov_uuid_to_set
                ON CONFLICT DO NOTHING;
            
                -- update submission
                ${submissionSelectCteQuery}
                UPDATE alcs.application_submission 
                SET local_government_uuid = local_gov_uuid_to_set.lg_uuid
                FROM local_gov_uuid_to_set WHERE
                local_gov_uuid_to_set.submission_uuid = alcs.application_submission.uuid;

                -- backup application data
                CREATE TABLE IF NOT EXISTS public.backup_set_missing_lg_on_application (
                    alcs_application_uuid UUID NOT NULL,
                    alcs_source_lg_uuid UUID,
                    alcs_desired_lg_uuid UUID,
                    PRIMARY KEY (alcs_application_uuid)
                );
                COMMENT ON TABLE public.backup_set_missing_lg_on_application IS 'This is a backup table for Application LFNG UUID. Delete once confirmed that migration is successful.';

                INSERT INTO public.backup_set_missing_lg_on_application (alcs_application_uuid, alcs_source_lg_uuid, alcs_desired_lg_uuid)
                ${applicationCteQuery}
                SELECT uuid, application_lg_uuid, local_government_uuid
                FROM applications_to_update
                ON CONFLICT DO NOTHING;
                
                -- update applications
                ${applicationCteQuery}
                UPDATE alcs.application
                SET  local_government_uuid = applications_to_update.local_government_uuid
                FROM applications_to_update
                WHERE  alcs.application.uuid = applications_to_update.uuid;
            END IF;
        END $$;
    `);
  }

  public async down(): Promise<void> {
    // nope
  }
}
