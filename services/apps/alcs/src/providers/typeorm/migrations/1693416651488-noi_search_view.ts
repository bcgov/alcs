import { MigrationInterface, QueryRunner } from 'typeorm';

export class noiSearchView1693416651488 implements MigrationInterface {
  name = 'noiSearchView1693416651488';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE VIEW "alcs"."notice_of_intent_submission_search_view" AS SELECT "nois"."uuid" AS "uuid", "nois"."applicant" AS "applicant", "noi"."uuid" AS "notice_of_intent_uuid", "noticeOfIntentType"."audit_deleted_date_at" AS "noticeOfIntentType_audit_deleted_date_at", "noticeOfIntentType"."audit_created_at" AS "noticeOfIntentType_audit_created_at", "noticeOfIntentType"."audit_updated_at" AS "noticeOfIntentType_audit_updated_at", "noticeOfIntentType"."audit_created_by" AS "noticeOfIntentType_audit_created_by", "noticeOfIntentType"."audit_updated_by" AS "noticeOfIntentType_audit_updated_by", "noticeOfIntentType"."label" AS "noticeOfIntentType_label", "noticeOfIntentType"."code" AS "noticeOfIntentType_code", "noticeOfIntentType"."description" AS "noticeOfIntentType_description", "noticeOfIntentType"."short_label" AS "noticeOfIntentType_short_label", "noticeOfIntentType"."html_description" AS "noticeOfIntentType_html_description", "noticeOfIntentType"."portal_label" AS "noticeOfIntentType_portal_label", "localGovernment"."name" AS "local_government_name", "nois"."file_number" AS "file_number", "nois"."local_government_uuid" AS "local_government_uuid", "nois"."type_code" AS "notice_of_intent_type_code", "nois"."is_draft" AS "is_draft", "noi"."date_submitted_to_alc" AS "date_submitted_to_alc", "noi"."decision_date" AS "decision_date", "noi"."region_code" AS "notice_of_intent_region_code", alcs.get_current_status_for_notice_of_intent_submission_by_uuid("nois"."uuid") AS "status" FROM "alcs"."notice_of_intent_submission" "nois" INNER JOIN "alcs"."notice_of_intent" "noi" ON  "noi"."file_number" = "nois"."file_number" AND "noi"."audit_deleted_date_at" IS NULL  INNER JOIN "alcs"."notice_of_intent_type" "noticeOfIntentType" ON  "nois"."type_code" = "noticeOfIntentType"."code" AND "noticeOfIntentType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "nois"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "nois"."audit_deleted_date_at" IS NULL`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'notice_of_intent_submission_search_view',
        'SELECT "nois"."uuid" AS "uuid", "nois"."applicant" AS "applicant", "noi"."uuid" AS "notice_of_intent_uuid", "noticeOfIntentType"."audit_deleted_date_at" AS "noticeOfIntentType_audit_deleted_date_at", "noticeOfIntentType"."audit_created_at" AS "noticeOfIntentType_audit_created_at", "noticeOfIntentType"."audit_updated_at" AS "noticeOfIntentType_audit_updated_at", "noticeOfIntentType"."audit_created_by" AS "noticeOfIntentType_audit_created_by", "noticeOfIntentType"."audit_updated_by" AS "noticeOfIntentType_audit_updated_by", "noticeOfIntentType"."label" AS "noticeOfIntentType_label", "noticeOfIntentType"."code" AS "noticeOfIntentType_code", "noticeOfIntentType"."description" AS "noticeOfIntentType_description", "noticeOfIntentType"."short_label" AS "noticeOfIntentType_short_label", "noticeOfIntentType"."html_description" AS "noticeOfIntentType_html_description", "noticeOfIntentType"."portal_label" AS "noticeOfIntentType_portal_label", "localGovernment"."name" AS "local_government_name", "nois"."file_number" AS "file_number", "nois"."local_government_uuid" AS "local_government_uuid", "nois"."type_code" AS "notice_of_intent_type_code", "nois"."is_draft" AS "is_draft", "noi"."date_submitted_to_alc" AS "date_submitted_to_alc", "noi"."decision_date" AS "decision_date", "noi"."region_code" AS "notice_of_intent_region_code", alcs.get_current_status_for_notice_of_intent_submission_by_uuid("nois"."uuid") AS "status" FROM "alcs"."notice_of_intent_submission" "nois" INNER JOIN "alcs"."notice_of_intent" "noi" ON  "noi"."file_number" = "nois"."file_number" AND "noi"."audit_deleted_date_at" IS NULL  INNER JOIN "alcs"."notice_of_intent_type" "noticeOfIntentType" ON  "nois"."type_code" = "noticeOfIntentType"."code" AND "noticeOfIntentType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "nois"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "nois"."audit_deleted_date_at" IS NULL',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'notice_of_intent_submission_search_view', 'alcs'],
    );
    await queryRunner.query(
      `DROP VIEW "alcs"."notice_of_intent_submission_search_view"`,
    );
  }
}
