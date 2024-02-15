import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResetREVGStatusIfNoReview1707948028191
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'oats') THEN
                WITH under_review_submissions AS (
                SELECT
                    as2.file_number,
                    astss.submission_uuid ,
                    astss.status_type_code,
                    astss.effective_date,
                    asr.uuid
                FROM
                    alcs.application_submission_to_submission_status astss
                JOIN alcs.application_submission as2 ON
                    astss.submission_uuid = as2."uuid"
                LEFT JOIN alcs.application_submission_review asr ON
                    asr.application_file_number = as2.file_number
                WHERE
                    asr."uuid" IS NULL
                    AND astss.status_type_code = 'REVG'
                    AND astss.effective_date IS NOT NULL)
                UPDATE
                    alcs.application_submission_to_submission_status
                SET
                    effective_date = NULL,
                    email_sent_date = NULL
                FROM
                    under_review_submissions
                WHERE
                    alcs.application_submission_to_submission_status.submission_uuid = under_review_submissions.submission_uuid
                    AND
                alcs.application_submission_to_submission_status.status_type_code = under_review_submissions.status_type_code;
            END IF;
        END $$;
    `);
  }

  public async down(): Promise<void> {
    // no
  }
}
