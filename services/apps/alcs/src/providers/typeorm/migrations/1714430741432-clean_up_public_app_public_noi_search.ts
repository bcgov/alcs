import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanUpPublicAppPublicNoiSearch1714430741432
  implements MigrationInterface
{
  name = 'CleanUpPublicAppPublicNoiSearch1714430741432';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'public_application_submission_search_view', 'alcs'],
    );
    await queryRunner.query(
      `DROP VIEW "alcs"."public_application_submission_search_view"`,
    );
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'public_notice_of_intent_submission_search_view', 'alcs'],
    );
    await queryRunner.query(
      `DROP VIEW "alcs"."public_notice_of_intent_submission_search_view"`,
    );

    await queryRunner.query(
      `CREATE VIEW "alcs"."public_notice_of_intent_submission_search_view" AS SELECT "noi_sub"."uuid" AS "uuid", "noi_sub"."applicant" AS "applicant", "localGovernment"."name" AS "local_government_name", "noi_sub"."file_number" AS "file_number", "noi_sub"."type_code" AS "notice_of_intent_type_code", "noi"."date_submitted_to_alc" AS "date_submitted_to_alc", decision_date.outcome AS "outcome", GREATEST(status_link.effective_date,  decision_date.date) AS "last_update", alcs.get_current_status_for_notice_of_intent_submission_by_uuid("noi_sub"."uuid") AS "status" FROM "alcs"."notice_of_intent_submission" "noi_sub" INNER JOIN "alcs"."notice_of_intent" "noi" ON  "noi"."file_number" = "noi_sub"."file_number" AND "noi"."hide_from_portal" = FALSE AND "noi"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "noi_sub"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL  LEFT JOIN (SELECT MAX("effective_date") AS "effective_date", submission_uuid AS "submission_uuid" FROM "alcs"."notice_of_intent_submission_to_submission_status" "status_link" GROUP BY submission_uuid) "status_link" ON status_link."submission_uuid" = "noi_sub"."uuid"  LEFT JOIN (SELECT DISTINCT ON (notice_of_intentuuid) decisiondate AS "date", outcome AS "outcome", dest_rank AS "dest_rank", notice_of_intentuuid AS "notice_of_intent_uuid" FROM (SELECT outcome_code AS "outcome", date AS "decisiondate", notice_of_intent_uuid AS "notice_of_intentuuid", RANK() OVER (PARTITION BY notice_of_intent_uuid ORDER BY date DESC, audit_created_at DESC) AS "dest_rank" FROM "alcs"."notice_of_intent_decision" "decision" WHERE ( is_draft = FALSE ) AND ( "decision"."audit_deleted_date_at" IS NULL )) "decisions" WHERE dest_rank = 1) "decision_date" ON decision_date."notice_of_intent_uuid" = "noi"."uuid" WHERE ( "noi_sub"."is_draft" = FALSE AND ("noi"."date_received_all_items" IS NOT NULL AND "noi"."date_received_all_items" <= NOW()) AND alcs.get_current_status_for_notice_of_intent_submission_by_uuid("noi_sub"."uuid")->>'status_type_code' != 'CANC' ) AND ( "noi_sub"."audit_deleted_date_at" IS NULL )`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'public_notice_of_intent_submission_search_view',
        'SELECT "noi_sub"."uuid" AS "uuid", "noi_sub"."applicant" AS "applicant", "localGovernment"."name" AS "local_government_name", "noi_sub"."file_number" AS "file_number", "noi_sub"."type_code" AS "notice_of_intent_type_code", "noi"."date_submitted_to_alc" AS "date_submitted_to_alc", decision_date.outcome AS "outcome", GREATEST(status_link.effective_date,  decision_date.date) AS "last_update", alcs.get_current_status_for_notice_of_intent_submission_by_uuid("noi_sub"."uuid") AS "status" FROM "alcs"."notice_of_intent_submission" "noi_sub" INNER JOIN "alcs"."notice_of_intent" "noi" ON  "noi"."file_number" = "noi_sub"."file_number" AND "noi"."hide_from_portal" = FALSE AND "noi"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "noi_sub"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL  LEFT JOIN (SELECT MAX("effective_date") AS "effective_date", submission_uuid AS "submission_uuid" FROM "alcs"."notice_of_intent_submission_to_submission_status" "status_link" GROUP BY submission_uuid) "status_link" ON status_link."submission_uuid" = "noi_sub"."uuid"  LEFT JOIN (SELECT DISTINCT ON (notice_of_intentuuid) decisiondate AS "date", outcome AS "outcome", dest_rank AS "dest_rank", notice_of_intentuuid AS "notice_of_intent_uuid" FROM (SELECT outcome_code AS "outcome", date AS "decisiondate", notice_of_intent_uuid AS "notice_of_intentuuid", RANK() OVER (PARTITION BY notice_of_intent_uuid ORDER BY date DESC, audit_created_at DESC) AS "dest_rank" FROM "alcs"."notice_of_intent_decision" "decision" WHERE ( is_draft = FALSE ) AND ( "decision"."audit_deleted_date_at" IS NULL )) "decisions" WHERE dest_rank = 1) "decision_date" ON decision_date."notice_of_intent_uuid" = "noi"."uuid" WHERE ( "noi_sub"."is_draft" = FALSE AND ("noi"."date_received_all_items" IS NOT NULL AND "noi"."date_received_all_items" <= NOW()) AND alcs.get_current_status_for_notice_of_intent_submission_by_uuid("noi_sub"."uuid")->>\'status_type_code\' != \'CANC\' ) AND ( "noi_sub"."audit_deleted_date_at" IS NULL )',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "alcs"."public_application_submission_search_view" AS SELECT "app_sub"."uuid" AS "uuid", "app_sub"."applicant" AS "applicant", "localGovernment"."name" AS "local_government_name", "app_sub"."file_number" AS "file_number", "app_sub"."type_code" AS "application_type_code", "app"."date_submitted_to_alc" AS "date_submitted_to_alc", decision_date.outcome AS "outcome", GREATEST(status_link.effective_date,  decision_date.date) AS "last_update", alcs.get_current_status_for_application_submission_by_uuid("app_sub"."uuid") AS "status" FROM "alcs"."application_submission" "app_sub" INNER JOIN "alcs"."application" "app" ON  "app"."file_number" = "app_sub"."file_number" AND "app"."hide_from_portal" = FALSE AND "app"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "app_sub"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL  LEFT JOIN (SELECT MAX("effective_date") AS "effective_date", submission_uuid AS "submission_uuid" FROM "alcs"."application_submission_to_submission_status" "status_link" GROUP BY submission_uuid) "status_link" ON status_link."submission_uuid" = "app_sub"."uuid"  LEFT JOIN (SELECT DISTINCT ON (application_uuid) decisiondate AS "date", outcome AS "outcome", dest_rank AS "dest_rank", applicationuuid AS "application_uuid" FROM (SELECT outcome_code AS "outcome", date AS "decisiondate", application_uuid AS "applicationuuid", RANK() OVER (PARTITION BY application_uuid ORDER BY date DESC, audit_created_at DESC) AS "dest_rank" FROM "alcs"."application_decision" "decision" WHERE ( is_draft = FALSE ) AND ( "decision"."audit_deleted_date_at" IS NULL )) "decisions" WHERE dest_rank = 1) "decision_date" ON decision_date."application_uuid" = "app"."uuid" WHERE ( "app_sub"."is_draft" = FALSE AND ("app"."date_received_all_items" IS NOT NULL AND "app"."date_received_all_items" <= NOW()) AND alcs.get_current_status_for_application_submission_by_uuid("app_sub"."uuid")->>'status_type_code' != 'CANC' ) AND ( "app_sub"."audit_deleted_date_at" IS NULL )`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'public_application_submission_search_view',
        'SELECT "app_sub"."uuid" AS "uuid", "app_sub"."applicant" AS "applicant", "localGovernment"."name" AS "local_government_name", "app_sub"."file_number" AS "file_number", "app_sub"."type_code" AS "application_type_code", "app"."date_submitted_to_alc" AS "date_submitted_to_alc", decision_date.outcome AS "outcome", GREATEST(status_link.effective_date,  decision_date.date) AS "last_update", alcs.get_current_status_for_application_submission_by_uuid("app_sub"."uuid") AS "status" FROM "alcs"."application_submission" "app_sub" INNER JOIN "alcs"."application" "app" ON  "app"."file_number" = "app_sub"."file_number" AND "app"."hide_from_portal" = FALSE AND "app"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "app_sub"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL  LEFT JOIN (SELECT MAX("effective_date") AS "effective_date", submission_uuid AS "submission_uuid" FROM "alcs"."application_submission_to_submission_status" "status_link" GROUP BY submission_uuid) "status_link" ON status_link."submission_uuid" = "app_sub"."uuid"  LEFT JOIN (SELECT DISTINCT ON (application_uuid) decisiondate AS "date", outcome AS "outcome", dest_rank AS "dest_rank", applicationuuid AS "application_uuid" FROM (SELECT outcome_code AS "outcome", date AS "decisiondate", application_uuid AS "applicationuuid", RANK() OVER (PARTITION BY application_uuid ORDER BY date DESC, audit_created_at DESC) AS "dest_rank" FROM "alcs"."application_decision" "decision" WHERE ( is_draft = FALSE ) AND ( "decision"."audit_deleted_date_at" IS NULL )) "decisions" WHERE dest_rank = 1) "decision_date" ON decision_date."application_uuid" = "app"."uuid" WHERE ( "app_sub"."is_draft" = FALSE AND ("app"."date_received_all_items" IS NOT NULL AND "app"."date_received_all_items" <= NOW()) AND alcs.get_current_status_for_application_submission_by_uuid("app_sub"."uuid")->>\'status_type_code\' != \'CANC\' ) AND ( "app_sub"."audit_deleted_date_at" IS NULL )',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'public_application_submission_search_view', 'alcs'],
    );
    await queryRunner.query(
      `DROP VIEW "alcs"."public_application_submission_search_view"`,
    );
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'public_notice_of_intent_submission_search_view', 'alcs'],
    );
    await queryRunner.query(
      `DROP VIEW "alcs"."public_notice_of_intent_submission_search_view"`,
    );

    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'planning_review_search_view',
        'SELECT "planning_review"."uuid" AS "uuid", "planningReviewType"."audit_deleted_date_at" AS "planningReviewType_audit_deleted_date_at", "planningReviewType"."audit_created_at" AS "planningReviewType_audit_created_at", "planningReviewType"."audit_updated_at" AS "planningReviewType_audit_updated_at", "planningReviewType"."audit_created_by" AS "planningReviewType_audit_created_by", "planningReviewType"."audit_updated_by" AS "planningReviewType_audit_updated_by", "planningReviewType"."label" AS "planningReviewType_label", "planningReviewType"."code" AS "planningReviewType_code", "planningReviewType"."description" AS "planningReviewType_description", "planningReviewType"."short_label" AS "planningReviewType_short_label", "planningReviewType"."background_color" AS "planningReviewType_background_color", "planningReviewType"."text_color" AS "planningReviewType_text_color", "planningReviewType"."html_description" AS "planningReviewType_html_description", "localGovernment"."name" AS "local_government_name", "planning_review"."file_number" AS "file_number", "planning_review"."document_name" AS "document_name", "planning_review"."local_government_uuid" AS "local_government_uuid", "planning_review"."type_code" AS "planning_review_type_code", "planning_review"."region_code" AS "region_code" FROM "alcs"."planning_review" "planning_review" INNER JOIN "alcs"."planning_review_type" "planningReviewType" ON "planning_review"."type_code" = "planningReviewType"."code"  LEFT JOIN "alcs"."local_government" "localGovernment" ON "planning_review"."local_government_uuid" = "localGovernment"."uuid"',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "alcs"."public_notice_of_intent_submission_search_view" AS SELECT "noi_sub"."uuid" AS "uuid", "noi_sub"."applicant" AS "applicant", "noi"."uuid" AS "notice_of_intent_uuid", "noticeOfIntentType"."audit_deleted_date_at" AS "noticeOfIntentType_audit_deleted_date_at", "noticeOfIntentType"."audit_created_at" AS "noticeOfIntentType_audit_created_at", "noticeOfIntentType"."audit_updated_at" AS "noticeOfIntentType_audit_updated_at", "noticeOfIntentType"."audit_created_by" AS "noticeOfIntentType_audit_created_by", "noticeOfIntentType"."audit_updated_by" AS "noticeOfIntentType_audit_updated_by", "noticeOfIntentType"."label" AS "noticeOfIntentType_label", "noticeOfIntentType"."code" AS "noticeOfIntentType_code", "noticeOfIntentType"."description" AS "noticeOfIntentType_description", "noticeOfIntentType"."short_label" AS "noticeOfIntentType_short_label", "noticeOfIntentType"."background_color" AS "noticeOfIntentType_background_color", "noticeOfIntentType"."text_color" AS "noticeOfIntentType_text_color", "noticeOfIntentType"."html_description" AS "noticeOfIntentType_html_description", "noticeOfIntentType"."portal_label" AS "noticeOfIntentType_portal_label", "noticeOfIntentType"."alc_fee_amount" AS "noticeOfIntentType_alc_fee_amount", "noticeOfIntentType"."government_fee_amount" AS "noticeOfIntentType_government_fee_amount", "localGovernment"."name" AS "local_government_name", "noi_sub"."file_number" AS "file_number", "noi_sub"."local_government_uuid" AS "local_government_uuid", "noi_sub"."type_code" AS "notice_of_intent_type_code", "noi"."date_submitted_to_alc" AS "date_submitted_to_alc", "noi"."decision_date" AS "decision_date", decision_date.outcome AS "outcome", decision_date.dest_rank AS "dest_rank", "noi"."region_code" AS "notice_of_intent_region_code", GREATEST(status_link.effective_date,  decision_date.date) AS "last_update", alcs.get_current_status_for_notice_of_intent_submission_by_uuid("noi_sub"."uuid") AS "status" FROM "alcs"."notice_of_intent_submission" "noi_sub" INNER JOIN "alcs"."notice_of_intent" "noi" ON  "noi"."file_number" = "noi_sub"."file_number" AND "noi"."hide_from_portal" = FALSE AND "noi"."audit_deleted_date_at" IS NULL  INNER JOIN "alcs"."notice_of_intent_type" "noticeOfIntentType" ON  "noi_sub"."type_code" = "noticeOfIntentType"."code" AND "noticeOfIntentType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "noi_sub"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL  LEFT JOIN (SELECT MAX("effective_date") AS "effective_date", submission_uuid AS "submission_uuid" FROM "alcs"."notice_of_intent_submission_to_submission_status" "status_link" GROUP BY submission_uuid) "status_link" ON status_link."submission_uuid" = "noi_sub"."uuid"  LEFT JOIN (SELECT DISTINCT ON (notice_of_intentuuid) decisiondate AS "date", outcome AS "outcome", dest_rank AS "dest_rank", notice_of_intentuuid AS "notice_of_intent_uuid" FROM (SELECT outcome_code AS "outcome", date AS "decisiondate", notice_of_intent_uuid AS "notice_of_intentuuid", RANK() OVER (PARTITION BY notice_of_intent_uuid ORDER BY date DESC, audit_created_at DESC) AS "dest_rank" FROM "alcs"."notice_of_intent_decision" "decision" WHERE ( is_draft = FALSE ) AND ( "decision"."audit_deleted_date_at" IS NULL )) "decisions" WHERE dest_rank = 1) "decision_date" ON decision_date."notice_of_intent_uuid" = "noi"."uuid" WHERE ( "noi_sub"."is_draft" = FALSE AND ("noi"."date_received_all_items" IS NOT NULL AND "noi"."date_received_all_items" <= NOW()) AND alcs.get_current_status_for_notice_of_intent_submission_by_uuid("noi_sub"."uuid")->>'status_type_code' != 'CANC' ) AND ( "noi_sub"."audit_deleted_date_at" IS NULL )`,
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
  }
}
