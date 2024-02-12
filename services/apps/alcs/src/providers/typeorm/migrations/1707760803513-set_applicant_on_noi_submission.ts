import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetApplicantOnNoiSubmission1707760803513
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        WITH ranked_parcels AS (
            SELECT *,
                ROW_NUMBER() OVER (
                    PARTITION BY notice_of_intent_submission_uuid
                    ORDER BY audit_created_at
                ) AS rn
            FROM alcs.notice_of_intent_parcel
        ),
        first_parcel_per_submission AS (
            SELECT uuid,
                audit_created_at,
                notice_of_intent_submission_uuid
            FROM ranked_parcels
            WHERE rn = 1
        ),
        ranked_owners AS (
            SELECT *,
                ROW_NUMBER() OVER (
                    PARTITION BY app_own.notice_of_intent_parcel_uuid
                    ORDER BY appo.audit_created_at
                ) AS rn,
                fp.notice_of_intent_submission_uuid as submission_uuid,
                nois.file_number AS file_num
            FROM alcs.notice_of_intent_owner appo
                JOIN alcs.notice_of_intent_parcel_owners_notice_of_intent_owner app_own ON app_own.notice_of_intent_owner_uuid = appo.uuid
                JOIN first_parcel_per_submission AS fp ON fp.uuid = app_own.notice_of_intent_parcel_uuid
                JOIN alcs.notice_of_intent_submission nois ON nois.uuid = fp.notice_of_intent_submission_uuid
            WHERE appo.type_code IN ('CRWN', 'ORGZ', 'INDV')
        ),
        applicants AS (
            SELECT COALESCE(last_name, organization_name) || (
                CASE
                    WHEN (
                        SELECT count(*)
                        FROM alcs.notice_of_intent_parcel_owners_notice_of_intent_owner
                        WHERE notice_of_intent_parcel_uuid = ranked_owners.notice_of_intent_parcel_uuid
                    ) > 1 THEN 'et al.'
                    ELSE ''
                END
            ) as applicant,
            submission_uuid,
            file_num
            FROM ranked_owners
            WHERE rn = 1
        )
        UPDATE alcs.notice_of_intent_submission 
        SET applicant = applicants.applicant
        FROM applicants
        WHERE "uuid" = applicants.submission_uuid;
    `);
  }

  public async down(): Promise<void> {
    // no
  }
}
