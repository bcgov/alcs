import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePublicSearch1713894259298 implements MigrationInterface {
  name = 'UpdatePublicSearch1713894259298';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'public_application_submission_search_view', 'alcs'],
    );
    await queryRunner.query(
      `DROP VIEW "alcs"."public_application_submission_search_view"`,
    );
    await queryRunner.query(
      `CREATE VIEW "alcs"."public_application_submission_search_view" AS SELECT "app_sub"."uuid" AS "uuid", "app_sub"."applicant" AS "applicant", "app"."uuid" AS "application_uuid", "localGovernment"."name" AS "local_government_name", "app_sub"."file_number" AS "file_number", "app_sub"."local_government_uuid" AS "local_government_uuid", "app_sub"."type_code" AS "application_type_code", "app"."date_submitted_to_alc" AS "date_submitted_to_alc", "app"."decision_date" AS "decision_date", decision_date.outcome AS "outcome", decision_date.dest_rank AS "dest_rank", "app"."region_code" AS "application_region_code", GREATEST(status_link.effective_date,  decision_date.date) AS "last_update", alcs.get_current_status_for_application_submission_by_uuid("app_sub"."uuid") AS "status" FROM "alcs"."application_submission" "app_sub" INNER JOIN "alcs"."application" "app" ON  "app"."file_number" = "app_sub"."file_number" AND "app"."hide_from_portal" = FALSE AND "app"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "app_sub"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL  LEFT JOIN (SELECT MAX("effective_date") AS "effective_date", submission_uuid AS "submission_uuid" FROM "alcs"."application_submission_to_submission_status" "status_link" GROUP BY submission_uuid) "status_link" ON status_link."submission_uuid" = "app_sub"."uuid"  LEFT JOIN (SELECT DISTINCT ON (application_uuid) decisiondate AS "date", outcome AS "outcome", dest_rank AS "dest_rank", applicationuuid AS "application_uuid" FROM (SELECT outcome_code AS "outcome", date AS "decisiondate", application_uuid AS "applicationuuid", RANK() OVER (PARTITION BY application_uuid ORDER BY date DESC, audit_created_at DESC) AS "dest_rank" FROM "alcs"."application_decision" "decision" WHERE ( is_draft = FALSE ) AND ( "decision"."audit_deleted_date_at" IS NULL )) "decisions" WHERE dest_rank = 1) "decision_date" ON decision_date."application_uuid" = "app"."uuid" WHERE ( "app_sub"."is_draft" = FALSE AND ("app"."date_received_all_items" IS NOT NULL AND "app"."date_received_all_items" <= NOW()) AND alcs.get_current_status_for_application_submission_by_uuid("app_sub"."uuid")->>'status_type_code' != 'CANC' ) AND ( "app_sub"."audit_deleted_date_at" IS NULL )`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'public_application_submission_search_view',
        'SELECT "app_sub"."uuid" AS "uuid", "app_sub"."applicant" AS "applicant", "app"."uuid" AS "application_uuid", "localGovernment"."name" AS "local_government_name", "app_sub"."file_number" AS "file_number", "app_sub"."local_government_uuid" AS "local_government_uuid", "app_sub"."type_code" AS "application_type_code", "app"."date_submitted_to_alc" AS "date_submitted_to_alc", "app"."decision_date" AS "decision_date", decision_date.outcome AS "outcome", decision_date.dest_rank AS "dest_rank", "app"."region_code" AS "application_region_code", GREATEST(status_link.effective_date,  decision_date.date) AS "last_update", alcs.get_current_status_for_application_submission_by_uuid("app_sub"."uuid") AS "status" FROM "alcs"."application_submission" "app_sub" INNER JOIN "alcs"."application" "app" ON  "app"."file_number" = "app_sub"."file_number" AND "app"."hide_from_portal" = FALSE AND "app"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "app_sub"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL  LEFT JOIN (SELECT MAX("effective_date") AS "effective_date", submission_uuid AS "submission_uuid" FROM "alcs"."application_submission_to_submission_status" "status_link" GROUP BY submission_uuid) "status_link" ON status_link."submission_uuid" = "app_sub"."uuid"  LEFT JOIN (SELECT DISTINCT ON (application_uuid) decisiondate AS "date", outcome AS "outcome", dest_rank AS "dest_rank", applicationuuid AS "application_uuid" FROM (SELECT outcome_code AS "outcome", date AS "decisiondate", application_uuid AS "applicationuuid", RANK() OVER (PARTITION BY application_uuid ORDER BY date DESC, audit_created_at DESC) AS "dest_rank" FROM "alcs"."application_decision" "decision" WHERE ( is_draft = FALSE ) AND ( "decision"."audit_deleted_date_at" IS NULL )) "decisions" WHERE dest_rank = 1) "decision_date" ON decision_date."application_uuid" = "app"."uuid" WHERE ( "app_sub"."is_draft" = FALSE AND ("app"."date_received_all_items" IS NOT NULL AND "app"."date_received_all_items" <= NOW()) AND alcs.get_current_status_for_application_submission_by_uuid("app_sub"."uuid")->>\'status_type_code\' != \'CANC\' ) AND ( "app_sub"."audit_deleted_date_at" IS NULL )',
      ],
    );

    await queryRunner.query(`
      CREATE INDEX "IDX_applicationUuid" ON "alcs"."application_decision" USING HASH ("application_uuid");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_noticeOfIntentUuid" ON "alcs"."notice_of_intent_decision" USING HASH ("notice_of_intent_uuid");
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
