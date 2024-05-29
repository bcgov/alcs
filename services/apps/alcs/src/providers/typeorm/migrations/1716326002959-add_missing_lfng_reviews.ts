import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingLfngReviews1716326002959 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const results = (await queryRunner.query(`
    SELECT
      file_number
    FROM (
      SELECT
        file_number,
        status_type_code,
        application_submission.uuid,
        alcs.get_current_status_for_application_submission_by_uuid (alcs.application_submission.uuid) ->> 'status_type_code' AS "current_status"
      FROM
        alcs.application_submission_to_submission_status
      LEFT JOIN alcs.application_submission ON application_submission.uuid = application_submission_to_submission_status.submission_uuid
      LEFT JOIN alcs.application_submission_review ON application_submission_review.application_file_number = application_submission.file_number
    WHERE
      status_type_code = 'REVG'
      AND application_submission_review.uuid IS NULL
      AND effective_date IS NOT NULL) a
    WHERE
      a.current_status = 'REVG';
    `)) as { file_number: string }[];

    for (const result of results) {
      await queryRunner.query(`
        INSERT INTO "alcs"."application_submission_review" 
          ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "uuid", "local_government_file_number", "first_name", "last_name", "position", "department", "phone_number", "email", "is_ocp_designation", "ocp_bylaw_name", "ocp_designation", "ocp_consistent", "is_subject_to_zoning", "zoning_bylaw_name", "zoning_designation", "zoning_minimum_lot_size", "is_zoning_consistent", "is_authorized", "application_file_number", "created_by_uuid") VALUES
		      (NULL, NOW(), NULL, 'seed-migration', NULL, DEFAULT, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ${result.file_number}, NULL);
      `);
      console.log(`Add Review for Application ${result.file_number}`);
    }
  }

  public async down(): Promise<void> {
    //Nope
  }
}
