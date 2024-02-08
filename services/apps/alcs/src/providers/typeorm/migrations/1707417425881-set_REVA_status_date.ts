import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetREVAStatusDate1707417425881 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        WITH application_discussions AS (
            SELECT
                adm.application_uuid,
                min(adm."date") AS "date"
            FROM
                alcs.application_decision_meeting adm
            GROUP BY
                adm.application_uuid
            ),
            applications AS (
            SELECT
                as2."uuid",
                ad."date"
            FROM
                application_discussions ad
            JOIN alcs.application a ON
                ad.application_uuid = a."uuid"
            JOIN alcs.application_submission as2 ON
                as2.file_number = a.file_number
            )
            UPDATE
                alcs.application_submission_to_submission_status
            SET
                effective_date = applications."date"
            FROM
                applications
            WHERE
                "submission_uuid" = applications."uuid"
                AND status_type_code = 'REVA';
    `);
  }

  public async down(): Promise<void> {
    // nope
  }
}
