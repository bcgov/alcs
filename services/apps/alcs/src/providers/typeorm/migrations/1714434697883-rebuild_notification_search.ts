import { MigrationInterface, QueryRunner } from 'typeorm';

export class RebuildNotificationSearch1714434697883
  implements MigrationInterface
{
  name = 'RebuildNotificationSearch1714434697883';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'public_notification_submission_search_view', 'alcs'],
    );
    await queryRunner.query(
      `DROP VIEW "alcs"."public_notification_submission_search_view"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2f863dc7ab4f76a87b160f3288" ON "alcs"."notice_of_intent" ("card_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_07e0aa0c43cb5a2bfc2c00282d" ON "alcs"."notice_of_intent_submission" ("file_number") `,
    );
    await queryRunner.query(
      `CREATE VIEW "alcs"."public_notification_submission_search_view" AS SELECT "noti_sub"."uuid" AS "uuid", "noti_sub"."applicant" AS "applicant", "localGovernment"."name" AS "local_government_name", "noti_sub"."file_number" AS "file_number", "noti"."type_code" AS "notification_type_code", "noti"."date_submitted_to_alc" AS "date_submitted_to_alc", alcs.get_current_status_for_notification_submission_by_uuid("noti_sub"."uuid") AS "status" FROM "alcs"."notification_submission" "noti_sub" INNER JOIN "alcs"."notification" "noti" ON  "noti"."file_number" = "noti_sub"."file_number" AND "noti"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "noti"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE ( alcs.get_current_status_for_notification_submission_by_uuid("noti_sub"."uuid")->>'status_type_code' = 'ALCR' ) AND ( "noti_sub"."audit_deleted_date_at" IS NULL )`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'public_notification_submission_search_view',
        'SELECT "noti_sub"."uuid" AS "uuid", "noti_sub"."applicant" AS "applicant", "localGovernment"."name" AS "local_government_name", "noti_sub"."file_number" AS "file_number", "noti"."type_code" AS "notification_type_code", "noti"."date_submitted_to_alc" AS "date_submitted_to_alc", alcs.get_current_status_for_notification_submission_by_uuid("noti_sub"."uuid") AS "status" FROM "alcs"."notification_submission" "noti_sub" INNER JOIN "alcs"."notification" "noti" ON  "noti"."file_number" = "noti_sub"."file_number" AND "noti"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "noti"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE ( alcs.get_current_status_for_notification_submission_by_uuid("noti_sub"."uuid")->>\'status_type_code\' = \'ALCR\' ) AND ( "noti_sub"."audit_deleted_date_at" IS NULL )',
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
      `DROP INDEX "alcs"."IDX_07e0aa0c43cb5a2bfc2c00282d"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_2f863dc7ab4f76a87b160f3288"`,
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
}
