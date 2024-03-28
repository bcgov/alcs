import { MigrationInterface, QueryRunner } from 'typeorm';

export class publicSearchViews1695677471273 implements MigrationInterface {
  name = 'publicSearchViews1695677471273';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE VIEW "alcs"."public_notice_of_intent_submission_search_view" AS SELECT "noi_sub"."uuid" AS "uuid", "noi_sub"."applicant" AS "applicant", "noi"."uuid" AS "notice_of_intent_uuid", "noticeOfIntentType"."audit_deleted_date_at" AS "noticeOfIntentType_audit_deleted_date_at", "noticeOfIntentType"."audit_created_at" AS "noticeOfIntentType_audit_created_at", "noticeOfIntentType"."audit_updated_at" AS "noticeOfIntentType_audit_updated_at", "noticeOfIntentType"."audit_created_by" AS "noticeOfIntentType_audit_created_by", "noticeOfIntentType"."audit_updated_by" AS "noticeOfIntentType_audit_updated_by", "noticeOfIntentType"."label" AS "noticeOfIntentType_label", "noticeOfIntentType"."code" AS "noticeOfIntentType_code", "noticeOfIntentType"."description" AS "noticeOfIntentType_description", "noticeOfIntentType"."short_label" AS "noticeOfIntentType_short_label", "noticeOfIntentType"."background_color" AS "noticeOfIntentType_background_color", "noticeOfIntentType"."text_color" AS "noticeOfIntentType_text_color", "noticeOfIntentType"."html_description" AS "noticeOfIntentType_html_description", "noticeOfIntentType"."portal_label" AS "noticeOfIntentType_portal_label", "localGovernment"."name" AS "local_government_name", "noi_sub"."file_number" AS "file_number", "noi_sub"."local_government_uuid" AS "local_government_uuid", "noi_sub"."type_code" AS "notice_of_intent_type_code", "noi"."date_submitted_to_alc" AS "date_submitted_to_alc", "noi"."decision_date" AS "decision_date", "noi"."region_code" AS "notice_of_intent_region_code", GREATEST(status_link.effective_date,  decision_date.date) AS "last_update", alcs.get_current_status_for_notice_of_intent_submission_by_uuid("noi_sub"."uuid") AS "status" FROM "alcs"."notice_of_intent_submission" "noi_sub" INNER JOIN "alcs"."notice_of_intent" "noi" ON  "noi"."file_number" = "noi_sub"."file_number" AND "noi"."audit_deleted_date_at" IS NULL  INNER JOIN "alcs"."notice_of_intent_type" "noticeOfIntentType" ON  "noi_sub"."type_code" = "noticeOfIntentType"."code" AND "noticeOfIntentType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "noi_sub"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL  LEFT JOIN (SELECT MAX("effective_date") AS "effective_date", submission_uuid AS "submission_uuid" FROM "alcs"."notice_of_intent_submission_to_submission_status" "status_link" GROUP BY submission_uuid) "status_link" ON status_link."submission_uuid" = "noi_sub"."uuid"  LEFT JOIN (SELECT MAX("date") AS "date", notice_of_intent_uuid AS "notice_of_intent_uuid" FROM "alcs"."notice_of_intent_decision" "decision_date" WHERE "decision_date"."audit_deleted_date_at" IS NULL GROUP BY notice_of_intent_uuid) "decision_date" ON decision_date."notice_of_intent_uuid" = "noi"."uuid" WHERE ( "noi_sub"."is_draft" = FALSE AND "noi"."date_received_all_items" IS NOT NULL AND alcs.get_current_status_for_notice_of_intent_submission_by_uuid("noi_sub"."uuid")->>'status_type_code' != 'CNCL' ) AND ( "noi_sub"."audit_deleted_date_at" IS NULL )`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'public_notice_of_intent_submission_search_view',
        'SELECT "noi_sub"."uuid" AS "uuid", "noi_sub"."applicant" AS "applicant", "noi"."uuid" AS "notice_of_intent_uuid", "noticeOfIntentType"."audit_deleted_date_at" AS "noticeOfIntentType_audit_deleted_date_at", "noticeOfIntentType"."audit_created_at" AS "noticeOfIntentType_audit_created_at", "noticeOfIntentType"."audit_updated_at" AS "noticeOfIntentType_audit_updated_at", "noticeOfIntentType"."audit_created_by" AS "noticeOfIntentType_audit_created_by", "noticeOfIntentType"."audit_updated_by" AS "noticeOfIntentType_audit_updated_by", "noticeOfIntentType"."label" AS "noticeOfIntentType_label", "noticeOfIntentType"."code" AS "noticeOfIntentType_code", "noticeOfIntentType"."description" AS "noticeOfIntentType_description", "noticeOfIntentType"."short_label" AS "noticeOfIntentType_short_label", "noticeOfIntentType"."background_color" AS "noticeOfIntentType_background_color", "noticeOfIntentType"."text_color" AS "noticeOfIntentType_text_color", "noticeOfIntentType"."html_description" AS "noticeOfIntentType_html_description", "noticeOfIntentType"."portal_label" AS "noticeOfIntentType_portal_label", "localGovernment"."name" AS "local_government_name", "noi_sub"."file_number" AS "file_number", "noi_sub"."local_government_uuid" AS "local_government_uuid", "noi_sub"."type_code" AS "notice_of_intent_type_code", "noi"."date_submitted_to_alc" AS "date_submitted_to_alc", "noi"."decision_date" AS "decision_date", "noi"."region_code" AS "notice_of_intent_region_code", GREATEST(status_link.effective_date,  decision_date.date) AS "last_update", alcs.get_current_status_for_notice_of_intent_submission_by_uuid("noi_sub"."uuid") AS "status" FROM "alcs"."notice_of_intent_submission" "noi_sub" INNER JOIN "alcs"."notice_of_intent" "noi" ON  "noi"."file_number" = "noi_sub"."file_number" AND "noi"."audit_deleted_date_at" IS NULL  INNER JOIN "alcs"."notice_of_intent_type" "noticeOfIntentType" ON  "noi_sub"."type_code" = "noticeOfIntentType"."code" AND "noticeOfIntentType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "noi_sub"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL  LEFT JOIN (SELECT MAX("effective_date") AS "effective_date", submission_uuid AS "submission_uuid" FROM "alcs"."notice_of_intent_submission_to_submission_status" "status_link" GROUP BY submission_uuid) "status_link" ON status_link."submission_uuid" = "noi_sub"."uuid"  LEFT JOIN (SELECT MAX("date") AS "date", notice_of_intent_uuid AS "notice_of_intent_uuid" FROM "alcs"."notice_of_intent_decision" "decision_date" WHERE "decision_date"."audit_deleted_date_at" IS NULL GROUP BY notice_of_intent_uuid) "decision_date" ON decision_date."notice_of_intent_uuid" = "noi"."uuid" WHERE ( "noi_sub"."is_draft" = FALSE AND "noi"."date_received_all_items" IS NOT NULL AND alcs.get_current_status_for_notice_of_intent_submission_by_uuid("noi_sub"."uuid")->>\'status_type_code\' != \'CNCL\' ) AND ( "noi_sub"."audit_deleted_date_at" IS NULL )',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "alcs"."public_application_submission_search_view" AS SELECT "app_sub"."uuid" AS "uuid", "app_sub"."applicant" AS "applicant", "app"."uuid" AS "application_uuid", "applicationType"."audit_deleted_date_at" AS "applicationType_audit_deleted_date_at", "applicationType"."audit_created_at" AS "applicationType_audit_created_at", "applicationType"."audit_updated_at" AS "applicationType_audit_updated_at", "applicationType"."audit_created_by" AS "applicationType_audit_created_by", "applicationType"."audit_updated_by" AS "applicationType_audit_updated_by", "applicationType"."label" AS "applicationType_label", "applicationType"."code" AS "applicationType_code", "applicationType"."description" AS "applicationType_description", "applicationType"."short_label" AS "applicationType_short_label", "applicationType"."background_color" AS "applicationType_background_color", "applicationType"."text_color" AS "applicationType_text_color", "applicationType"."html_description" AS "applicationType_html_description", "applicationType"."portal_label" AS "applicationType_portal_label", "localGovernment"."name" AS "local_government_name", "app_sub"."file_number" AS "file_number", "app_sub"."local_government_uuid" AS "local_government_uuid", "app_sub"."type_code" AS "application_type_code", "app"."date_submitted_to_alc" AS "date_submitted_to_alc", "app"."decision_date" AS "decision_date", "app"."region_code" AS "application_region_code", GREATEST(status_link.effective_date,  decision_date.date) AS "last_update", alcs.get_current_status_for_application_submission_by_uuid("app_sub"."uuid") AS "status" FROM "alcs"."application_submission" "app_sub" INNER JOIN "alcs"."application" "app" ON  "app"."file_number" = "app_sub"."file_number" AND "app"."audit_deleted_date_at" IS NULL  INNER JOIN "alcs"."application_type" "applicationType" ON  "app_sub"."type_code" = "applicationType"."code" AND "applicationType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "app_sub"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL  LEFT JOIN (SELECT MAX("effective_date") AS "effective_date", submission_uuid AS "submission_uuid" FROM "alcs"."application_submission_to_submission_status" "status_link" GROUP BY submission_uuid) "status_link" ON status_link."submission_uuid" = "app_sub"."uuid"  LEFT JOIN (SELECT MAX("date") AS "date", application_uuid AS "application_uuid" FROM "alcs"."application_decision" "decision_date" WHERE "decision_date"."audit_deleted_date_at" IS NULL GROUP BY application_uuid) "decision_date" ON decision_date."application_uuid" = "app"."uuid" WHERE ( "app_sub"."is_draft" = FALSE AND "app"."date_received_all_items" IS NOT NULL AND alcs.get_current_status_for_application_submission_by_uuid("app_sub"."uuid")->>'status_type_code' != 'CNCL' ) AND ( "app_sub"."audit_deleted_date_at" IS NULL )`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'public_application_submission_search_view',
        'SELECT "app_sub"."uuid" AS "uuid", "app_sub"."applicant" AS "applicant", "app"."uuid" AS "application_uuid", "applicationType"."audit_deleted_date_at" AS "applicationType_audit_deleted_date_at", "applicationType"."audit_created_at" AS "applicationType_audit_created_at", "applicationType"."audit_updated_at" AS "applicationType_audit_updated_at", "applicationType"."audit_created_by" AS "applicationType_audit_created_by", "applicationType"."audit_updated_by" AS "applicationType_audit_updated_by", "applicationType"."label" AS "applicationType_label", "applicationType"."code" AS "applicationType_code", "applicationType"."description" AS "applicationType_description", "applicationType"."short_label" AS "applicationType_short_label", "applicationType"."background_color" AS "applicationType_background_color", "applicationType"."text_color" AS "applicationType_text_color", "applicationType"."html_description" AS "applicationType_html_description", "applicationType"."portal_label" AS "applicationType_portal_label", "localGovernment"."name" AS "local_government_name", "app_sub"."file_number" AS "file_number", "app_sub"."local_government_uuid" AS "local_government_uuid", "app_sub"."type_code" AS "application_type_code", "app"."date_submitted_to_alc" AS "date_submitted_to_alc", "app"."decision_date" AS "decision_date", "app"."region_code" AS "application_region_code", GREATEST(status_link.effective_date,  decision_date.date) AS "last_update", alcs.get_current_status_for_application_submission_by_uuid("app_sub"."uuid") AS "status" FROM "alcs"."application_submission" "app_sub" INNER JOIN "alcs"."application" "app" ON  "app"."file_number" = "app_sub"."file_number" AND "app"."audit_deleted_date_at" IS NULL  INNER JOIN "alcs"."application_type" "applicationType" ON  "app_sub"."type_code" = "applicationType"."code" AND "applicationType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "app_sub"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL  LEFT JOIN (SELECT MAX("effective_date") AS "effective_date", submission_uuid AS "submission_uuid" FROM "alcs"."application_submission_to_submission_status" "status_link" GROUP BY submission_uuid) "status_link" ON status_link."submission_uuid" = "app_sub"."uuid"  LEFT JOIN (SELECT MAX("date") AS "date", application_uuid AS "application_uuid" FROM "alcs"."application_decision" "decision_date" WHERE "decision_date"."audit_deleted_date_at" IS NULL GROUP BY application_uuid) "decision_date" ON decision_date."application_uuid" = "app"."uuid" WHERE ( "app_sub"."is_draft" = FALSE AND "app"."date_received_all_items" IS NOT NULL AND alcs.get_current_status_for_application_submission_by_uuid("app_sub"."uuid")->>\'status_type_code\' != \'CNCL\' ) AND ( "app_sub"."audit_deleted_date_at" IS NULL )',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "alcs"."public_notification_submission_search_view" AS SELECT "noti_sub"."uuid" AS "uuid", "noti_sub"."applicant" AS "applicant", "noti"."uuid" AS "notification_uuid", "notificationType"."audit_deleted_date_at" AS "notificationType_audit_deleted_date_at", "notificationType"."audit_created_at" AS "notificationType_audit_created_at", "notificationType"."audit_updated_at" AS "notificationType_audit_updated_at", "notificationType"."audit_created_by" AS "notificationType_audit_created_by", "notificationType"."audit_updated_by" AS "notificationType_audit_updated_by", "notificationType"."label" AS "notificationType_label", "notificationType"."code" AS "notificationType_code", "notificationType"."description" AS "notificationType_description", "notificationType"."short_label" AS "notificationType_short_label", "notificationType"."background_color" AS "notificationType_background_color", "notificationType"."text_color" AS "notificationType_text_color", "notificationType"."html_description" AS "notificationType_html_description", "notificationType"."portal_label" AS "notificationType_portal_label", "localGovernment"."name" AS "local_government_name", "noti_sub"."file_number" AS "file_number", "noti_sub"."local_government_uuid" AS "local_government_uuid", "noti"."type_code" AS "notification_type_code", "noti"."date_submitted_to_alc" AS "date_submitted_to_alc", "noti"."region_code" AS "notification_region_code", alcs.get_current_status_for_notification_submission_by_uuid("noti_sub"."uuid") AS "status" FROM "alcs"."notification_submission" "noti_sub" INNER JOIN "alcs"."notification" "noti" ON  "noti"."file_number" = "noti_sub"."file_number" AND "noti"."audit_deleted_date_at" IS NULL  INNER JOIN "alcs"."notification_type" "notificationType" ON  "noti_sub"."type_code" = "notificationType"."code" AND "notificationType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "noti"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE ( alcs.get_current_status_for_notification_submission_by_uuid("noti_sub"."uuid")->>'status_type_code' = 'ALCR' ) AND ( "noti_sub"."audit_deleted_date_at" IS NULL )`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'public_notification_submission_search_view',
        'SELECT "noti_sub"."uuid" AS "uuid", "noti_sub"."applicant" AS "applicant", "noti"."uuid" AS "notification_uuid", "notificationType"."audit_deleted_date_at" AS "notificationType_audit_deleted_date_at", "notificationType"."audit_created_at" AS "notificationType_audit_created_at", "notificationType"."audit_updated_at" AS "notificationType_audit_updated_at", "notificationType"."audit_created_by" AS "notificationType_audit_created_by", "notificationType"."audit_updated_by" AS "notificationType_audit_updated_by", "notificationType"."label" AS "notificationType_label", "notificationType"."code" AS "notificationType_code", "notificationType"."description" AS "notificationType_description", "notificationType"."short_label" AS "notificationType_short_label", "notificationType"."background_color" AS "notificationType_background_color", "notificationType"."text_color" AS "notificationType_text_color", "notificationType"."html_description" AS "notificationType_html_description", "notificationType"."portal_label" AS "notificationType_portal_label", "localGovernment"."name" AS "local_government_name", "noti_sub"."file_number" AS "file_number", "noti_sub"."local_government_uuid" AS "local_government_uuid", "noti"."type_code" AS "notification_type_code", "noti"."date_submitted_to_alc" AS "date_submitted_to_alc", "noti"."region_code" AS "notification_region_code", alcs.get_current_status_for_notification_submission_by_uuid("noti_sub"."uuid") AS "status" FROM "alcs"."notification_submission" "noti_sub" INNER JOIN "alcs"."notification" "noti" ON  "noti"."file_number" = "noti_sub"."file_number" AND "noti"."audit_deleted_date_at" IS NULL  INNER JOIN "alcs"."notification_type" "notificationType" ON  "noti_sub"."type_code" = "notificationType"."code" AND "notificationType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "noti"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE ( alcs.get_current_status_for_notification_submission_by_uuid("noti_sub"."uuid")->>\'status_type_code\' = \'ALCR\' ) AND ( "noti_sub"."audit_deleted_date_at" IS NULL )',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'public_notification_submission_search_view', 'alcs'],
    );
    await queryRunner.query(
      `DROP VIEW "alcs"."public_notification_submission_search_view"`,
    );
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
  }
}