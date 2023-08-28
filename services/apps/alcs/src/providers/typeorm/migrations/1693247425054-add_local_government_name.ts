import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLocalGovernmentName1693247425054 implements MigrationInterface {
  name = 'addLocalGovernmentName1693247425054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'application_submission_search_view', 'alcs'],
    );
    await queryRunner.query(
      `DROP VIEW "alcs"."application_submission_search_view"`,
    );
    await queryRunner.query(
      `CREATE VIEW "alcs"."application_submission_search_view" AS SELECT "as2"."uuid" AS "uuid", "as2"."applicant" AS "applicant", "a"."uuid" AS "application_uuid", "applicationType"."audit_deleted_date_at" AS "applicationType_audit_deleted_date_at", "applicationType"."audit_created_at" AS "applicationType_audit_created_at", "applicationType"."audit_updated_at" AS "applicationType_audit_updated_at", "applicationType"."audit_created_by" AS "applicationType_audit_created_by", "applicationType"."audit_updated_by" AS "applicationType_audit_updated_by", "applicationType"."label" AS "applicationType_label", "applicationType"."code" AS "applicationType_code", "applicationType"."description" AS "applicationType_description", "applicationType"."short_label" AS "applicationType_short_label", "applicationType"."background_color" AS "applicationType_background_color", "applicationType"."text_color" AS "applicationType_text_color", "applicationType"."html_description" AS "applicationType_html_description", "applicationType"."portal_label" AS "applicationType_portal_label", "localGovernment"."name" AS "local_government_name", "as2"."file_number" AS "file_number", "as2"."local_government_uuid" AS "local_government_uuid", "as2"."type_code" AS "application_type_code", "a"."legacy_id" AS "legacy_id", "a"."date_submitted_to_alc" AS "date_submitted_to_alc", "a"."decision_date" AS "decision_date", "a"."region_code" AS "application_region_code", alcs.get_current_status_for_submission_by_uuid("as2"."uuid") AS "status" FROM "alcs"."application_submission" "as2" INNER JOIN "alcs"."application" "a" ON  "a"."file_number" = "as2"."file_number" AND "a"."audit_deleted_date_at" IS NULL  INNER JOIN "alcs"."application_type" "applicationType" ON  "as2"."type_code" = "applicationType"."code" AND "applicationType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "as2"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "as2"."audit_deleted_date_at" IS NULL`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'application_submission_search_view',
        'SELECT "as2"."uuid" AS "uuid", "as2"."applicant" AS "applicant", "a"."uuid" AS "application_uuid", "applicationType"."audit_deleted_date_at" AS "applicationType_audit_deleted_date_at", "applicationType"."audit_created_at" AS "applicationType_audit_created_at", "applicationType"."audit_updated_at" AS "applicationType_audit_updated_at", "applicationType"."audit_created_by" AS "applicationType_audit_created_by", "applicationType"."audit_updated_by" AS "applicationType_audit_updated_by", "applicationType"."label" AS "applicationType_label", "applicationType"."code" AS "applicationType_code", "applicationType"."description" AS "applicationType_description", "applicationType"."short_label" AS "applicationType_short_label", "applicationType"."background_color" AS "applicationType_background_color", "applicationType"."text_color" AS "applicationType_text_color", "applicationType"."html_description" AS "applicationType_html_description", "applicationType"."portal_label" AS "applicationType_portal_label", "localGovernment"."name" AS "local_government_name", "as2"."file_number" AS "file_number", "as2"."local_government_uuid" AS "local_government_uuid", "as2"."type_code" AS "application_type_code", "a"."legacy_id" AS "legacy_id", "a"."date_submitted_to_alc" AS "date_submitted_to_alc", "a"."decision_date" AS "decision_date", "a"."region_code" AS "application_region_code", alcs.get_current_status_for_submission_by_uuid("as2"."uuid") AS "status" FROM "alcs"."application_submission" "as2" INNER JOIN "alcs"."application" "a" ON  "a"."file_number" = "as2"."file_number" AND "a"."audit_deleted_date_at" IS NULL  INNER JOIN "alcs"."application_type" "applicationType" ON  "as2"."type_code" = "applicationType"."code" AND "applicationType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "as2"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "as2"."audit_deleted_date_at" IS NULL',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
