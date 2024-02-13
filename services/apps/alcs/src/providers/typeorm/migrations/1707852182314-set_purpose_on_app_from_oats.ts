import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetPurposeOnAppFromOats1707852182314
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        WITH alcs_app_sub_to_update AS (
        SELECT
            as2.file_number
        FROM
            alcs.application_submission as2
        WHERE
            audit_created_by = 'oats_etl'
            AND purpose IS NULL
            AND type_code IN ('POFO', 'ROSO', 'PFRS', 'INC')
        ),
        purpose_with_background AS (
        SELECT
            alr_application_id, 
            oaa.proposal_summary_desc,
            oaa.proposal_background_desc
        FROM
            oats.oats_alr_applications oaa
        JOIN alcs_app_sub_to_update AS alcs_sub ON
            alcs_sub.file_number::bigint = oaa.alr_application_id
        ),
        mapped_backgrounds AS (
        SELECT
            pb.alr_application_id::TEXT,
            CASE 
                WHEN length(proposal_background_desc) > 10 THEN pb.proposal_summary_desc || '. Background: ' || pb.proposal_background_desc
                ELSE pb.proposal_summary_desc
            END AS oats_purpose
        FROM
            purpose_with_background AS pb
            )
        UPDATE alcs.application_submission 
        SET purpose = COALESCE(mapped_backgrounds.oats_purpose, alcs.application_submission.purpose)
        FROM mapped_backgrounds
        WHERE alcs.application_submission.file_number = mapped_backgrounds.alr_application_id;
    `);
  }

  public async down(): Promise<void> {}
}
