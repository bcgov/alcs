import { MigrationInterface, QueryRunner } from 'typeorm';

export class populateSubmissionStatuses1689114932307
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        TRUNCATE alcs.application_submission_to_submission_status;
        DELETE FROM alcs.application_submission_status_type;
      `,
    );

    await queryRunner.query(
      `
        INSERT INTO "alcs"."application_submission_status_type" 
            ("audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "weight") VALUES
            (NOW(), NULL, 'migration_seed', NULL, 'In Progress', 'PROG', 'Application is in progress and has not been submitted', 0),
            (NOW(), NULL, 'migration_seed', NULL, 'L/FNG Returned as Incomplete', 'INCM', 'L/FNG reviewed application and sent it back as incomplete', 1),
            (NOW(), NULL, 'migration_seed', NULL, 'Wrong L/FNG', 'WRNG', 'Application was sent to wrong L/FNG and has been returned', 1),
            (NOW(), NULL, 'migration_seed', NULL, 'Submitted to L/FNG', 'SUBG', 'Application is ready to be reviewed by L/FNG', 2),
            (NOW(), NULL, 'migration_seed', NULL, 'Review Created', 'REVG', 'Application is under review by L/FNG', 3),
            (NOW(), NULL, 'migration_seed', NULL, 'Submitted to ALC', 'SUBM', 'Application has been submitted', 4),
            (NOW(), NULL, 'migration_seed', NULL, 'Submitted to ALC - Incomplete', 'SUIN', 'Application received Acknowledge Incomplete Date', 5),
            (NOW(), NULL, 'migration_seed', NULL, 'Received By ALC', 'RECA', 'Application received Date Received All Items', 6),
            (NOW(), NULL, 'migration_seed', NULL, 'Under Review by ALC', 'REVA', 'Application received Discussion Date', 7),
            (NOW(), NULL, 'migration_seed', NULL, 'Decision Released', 'ALCD', 'First decision released', 8),
            (NOW(), NULL, 'migration_seed', NULL, 'L/FNG Refused to Forward', 'RFFG', 'L/FNG Refused to forward application', 9),
            (NOW(), NULL, 'migration_seed', NULL, 'Cancelled', 'CANC', 'Application has been cancelled by the applicant', 10);
        `,
    );

    // populate all statuses for all submissions with empty effective dates
    await queryRunner.query(
      `
        INSERT INTO alcs.application_submission_to_submission_status (submission_uuid, status_type_code)
        SELECT as2.uuid, sst.code 
        FROM alcs.application_submission as2 
        CROSS JOIN alcs.application_submission_status_type sst;
     `,
    );

    // ALCD Decision released
    await queryRunner.query(
      `
        UPDATE alcs.application_submission_to_submission_status AS asst
            SET effective_date = a.decision_date
            FROM alcs.application a
        JOIN alcs.application_submission aps ON a.file_number = aps.file_number
            WHERE asst.status_type_code = 'ALCD'
        AND asst.submission_uuid = aps.uuid
    `,
    );

    // REVA Under Review by ALC
    await queryRunner.query(
      `
        UPDATE alcs.application_submission_to_submission_status AS asst
        SET effective_date = a."date"
        FROM (
                SELECT MIN(adm."date") AS "date",
                    aps.uuid
                FROM alcs.application_decision_meeting adm
                    JOIN alcs.application a ON a.uuid = adm.application_uuid
                    JOIN alcs.application_submission aps ON a.file_number = aps.file_number
                GROUP BY adm.application_uuid,
                    aps.uuid
            ) AS a
        WHERE asst.status_type_code = 'REVA'
            AND asst.submission_uuid = a.uuid;
    `,
    );

    // RECA Received By ALC
    await queryRunner.query(
      `
        UPDATE alcs.application_submission_to_submission_status AS asst
        SET effective_date = a.date_received_all_items
        FROM alcs.application a
            JOIN alcs.application_submission aps ON a.file_number = aps.file_number
        WHERE asst.status_type_code = 'RECA'
            AND asst.submission_uuid = aps.uuid;`,
    );

    // SUIN Submitted to ALC - Incomplete
    await queryRunner.query(
      `
        UPDATE alcs.application_submission_to_submission_status AS asst
        SET effective_date = a.date_acknowledged_incomplete
        FROM alcs.application a
            JOIN alcs.application_submission aps ON a.file_number = aps.file_number
        WHERE asst.status_type_code = 'SUIN'
            AND asst.submission_uuid = aps.uuid; 
     `,
    );

    // SUBM Submitted to ALC
    await queryRunner.query(
      `
    UPDATE alcs.application_submission_to_submission_status AS asst
        SET effective_date = a.date_submitted_to_alc
        FROM alcs.application a
            JOIN alcs.application_submission aps ON a.file_number = aps.file_number
        WHERE asst.status_type_code = 'SUBM'
            AND asst.submission_uuid = aps.uuid;`,
    );

    // PROG In Progress
    await queryRunner.query(
      `
        UPDATE alcs.application_submission_to_submission_status AS asst
            SET effective_date = aps.audit_created_at
            FROM alcs.application_submission aps
            WHERE asst.status_type_code = 'PROG'
                AND asst.submission_uuid = aps.uuid;`,
    );

    await queryRunner.query(
      `
      UPDATE alcs.application_submission_to_submission_status AS asst
      SET effective_date = aps.audit_updated_at
      FROM alcs.application_submission aps
      WHERE asst.status_type_code = 'CANC'
          AND asst.submission_uuid = aps.uuid
          AND aps.status_code = 'CANC';`,
    );

    // set all effective dates to start of day
    await queryRunner.query(
      `
      UPDATE alcs.application_submission_to_submission_status AS asst
      SET effective_date = date_trunc('day', effective_date);
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
