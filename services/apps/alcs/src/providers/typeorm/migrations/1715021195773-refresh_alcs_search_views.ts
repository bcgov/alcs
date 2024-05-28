import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefreshAlcsSearchViews1715021195773 implements MigrationInterface {
  name = 'RefreshAlcsSearchViews1715021195773';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'inquiry_search_view', 'alcs'],
    );
    await queryRunner.query(`DROP VIEW "alcs"."inquiry_search_view"`);
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'application_submission_search_view', 'alcs'],
    );
    await queryRunner.query(
      `DROP VIEW "alcs"."application_submission_search_view"`,
    );
    await queryRunner.query(
      `CREATE VIEW "alcs"."inquiry_search_view" AS SELECT "inquiry"."uuid" AS "inquiry_uuid", "inquiry"."open" AS "open", "inquiryType"."audit_deleted_date_at" AS "inquiryType_audit_deleted_date_at", "inquiryType"."audit_created_at" AS "inquiryType_audit_created_at", "inquiryType"."audit_updated_at" AS "inquiryType_audit_updated_at", "inquiryType"."audit_created_by" AS "inquiryType_audit_created_by", "inquiryType"."audit_updated_by" AS "inquiryType_audit_updated_by", "inquiryType"."label" AS "inquiryType_label", "inquiryType"."code" AS "inquiryType_code", "inquiryType"."description" AS "inquiryType_description", "inquiryType"."short_label" AS "inquiryType_short_label", "inquiryType"."background_color" AS "inquiryType_background_color", "inquiryType"."text_color" AS "inquiryType_text_color", "inquiryType"."html_description" AS "inquiryType_html_description", "localGovernment"."name" AS "local_government_name", "inquiry"."file_number" AS "file_number", "inquiry"."inquirer_first_name" AS "inquirer_first_name", "inquiry"."inquirer_last_name" AS "inquirer_last_name", "inquiry"."inquirer_organization" AS "inquirer_organization", "inquiry"."type_code" AS "inquiry_type_code", "inquiry"."date_submitted_to_alc" AS "date_submitted_to_alc" FROM "alcs"."inquiry" "inquiry" INNER JOIN "alcs"."inquiry_type" "inquiryType" ON  "inquiry"."type_code" = "inquiryType"."code" AND "inquiryType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "inquiry"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "inquiry"."audit_deleted_date_at" IS NULL`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'inquiry_search_view',
        'SELECT "inquiry"."uuid" AS "inquiry_uuid", "inquiry"."open" AS "open", "inquiryType"."audit_deleted_date_at" AS "inquiryType_audit_deleted_date_at", "inquiryType"."audit_created_at" AS "inquiryType_audit_created_at", "inquiryType"."audit_updated_at" AS "inquiryType_audit_updated_at", "inquiryType"."audit_created_by" AS "inquiryType_audit_created_by", "inquiryType"."audit_updated_by" AS "inquiryType_audit_updated_by", "inquiryType"."label" AS "inquiryType_label", "inquiryType"."code" AS "inquiryType_code", "inquiryType"."description" AS "inquiryType_description", "inquiryType"."short_label" AS "inquiryType_short_label", "inquiryType"."background_color" AS "inquiryType_background_color", "inquiryType"."text_color" AS "inquiryType_text_color", "inquiryType"."html_description" AS "inquiryType_html_description", "localGovernment"."name" AS "local_government_name", "inquiry"."file_number" AS "file_number", "inquiry"."inquirer_first_name" AS "inquirer_first_name", "inquiry"."inquirer_last_name" AS "inquirer_last_name", "inquiry"."inquirer_organization" AS "inquirer_organization", "inquiry"."type_code" AS "inquiry_type_code", "inquiry"."date_submitted_to_alc" AS "date_submitted_to_alc" FROM "alcs"."inquiry" "inquiry" INNER JOIN "alcs"."inquiry_type" "inquiryType" ON  "inquiry"."type_code" = "inquiryType"."code" AND "inquiryType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "inquiry"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "inquiry"."audit_deleted_date_at" IS NULL',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "alcs"."application_submission_search_view" AS SELECT "app_sub"."uuid" AS "uuid", "app_sub"."applicant" AS "applicant", "app"."uuid" AS "application_uuid", "localGovernment"."name" AS "local_government_name", "app_sub"."file_number" AS "file_number", "app"."type_code" AS "application_type_code", "app"."date_submitted_to_alc" AS "date_submitted_to_alc", "app"."decision_date" AS "decision_date", "app"."region_code" AS "application_region_code", alcs.get_current_status_for_application_submission_by_uuid("app_sub"."uuid") AS "status" FROM "alcs"."application_submission" "app_sub" INNER JOIN "alcs"."application" "app" ON  "app"."file_number" = "app_sub"."file_number" AND "app"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "app_sub"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "app_sub"."audit_deleted_date_at" IS NULL`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'application_submission_search_view',
        'SELECT "app_sub"."uuid" AS "uuid", "app_sub"."applicant" AS "applicant", "app"."uuid" AS "application_uuid", "localGovernment"."name" AS "local_government_name", "app_sub"."file_number" AS "file_number", "app"."type_code" AS "application_type_code", "app"."date_submitted_to_alc" AS "date_submitted_to_alc", "app"."decision_date" AS "decision_date", "app"."region_code" AS "application_region_code", alcs.get_current_status_for_application_submission_by_uuid("app_sub"."uuid") AS "status" FROM "alcs"."application_submission" "app_sub" INNER JOIN "alcs"."application" "app" ON  "app"."file_number" = "app_sub"."file_number" AND "app"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "app_sub"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "app_sub"."audit_deleted_date_at" IS NULL',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'application_submission_search_view', 'alcs'],
    );
    await queryRunner.query(
      `DROP VIEW "alcs"."application_submission_search_view"`,
    );
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'inquiry_search_view', 'alcs'],
    );
    await queryRunner.query(`DROP VIEW "alcs"."inquiry_search_view"`);
    await queryRunner.query(
      `CREATE VIEW "alcs"."application_submission_search_view" AS SELECT "as2"."uuid" AS "uuid", "as2"."applicant" AS "applicant", "a"."uuid" AS "application_uuid", "localGovernment"."name" AS "local_government_name", "as2"."file_number" AS "file_number", "as2"."local_government_uuid" AS "local_government_uuid", "as2"."type_code" AS "application_type_code", "as2"."is_draft" AS "is_draft", "a"."legacy_id" AS "legacy_id", "a"."date_submitted_to_alc" AS "date_submitted_to_alc", "a"."decision_date" AS "decision_date", "a"."region_code" AS "application_region_code", alcs.get_current_status_for_application_submission_by_uuid("as2"."uuid") AS "status" FROM "alcs"."application_submission" "as2" INNER JOIN "alcs"."application" "a" ON  "a"."file_number" = "as2"."file_number" AND "a"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "as2"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "as2"."audit_deleted_date_at" IS NULL`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'application_submission_search_view',
        'SELECT "as2"."uuid" AS "uuid", "as2"."applicant" AS "applicant", "a"."uuid" AS "application_uuid", "localGovernment"."name" AS "local_government_name", "as2"."file_number" AS "file_number", "as2"."local_government_uuid" AS "local_government_uuid", "as2"."type_code" AS "application_type_code", "as2"."is_draft" AS "is_draft", "a"."legacy_id" AS "legacy_id", "a"."date_submitted_to_alc" AS "date_submitted_to_alc", "a"."decision_date" AS "decision_date", "a"."region_code" AS "application_region_code", alcs.get_current_status_for_application_submission_by_uuid("as2"."uuid") AS "status" FROM "alcs"."application_submission" "as2" INNER JOIN "alcs"."application" "a" ON  "a"."file_number" = "as2"."file_number" AND "a"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "as2"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "as2"."audit_deleted_date_at" IS NULL',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "alcs"."inquiry_search_view" AS SELECT "inquiry"."uuid" AS "inquiry_uuid", "inquiry"."open" AS "open", "inquiryType"."audit_deleted_date_at" AS "inquiryType_audit_deleted_date_at", "inquiryType"."audit_created_at" AS "inquiryType_audit_created_at", "inquiryType"."audit_updated_at" AS "inquiryType_audit_updated_at", "inquiryType"."audit_created_by" AS "inquiryType_audit_created_by", "inquiryType"."audit_updated_by" AS "inquiryType_audit_updated_by", "inquiryType"."label" AS "inquiryType_label", "inquiryType"."code" AS "inquiryType_code", "inquiryType"."description" AS "inquiryType_description", "inquiryType"."short_label" AS "inquiryType_short_label", "inquiryType"."background_color" AS "inquiryType_background_color", "inquiryType"."text_color" AS "inquiryType_text_color", "inquiryType"."html_description" AS "inquiryType_html_description", "localGovernment"."name" AS "local_government_name", "inquiry"."file_number" AS "file_number", "inquiry"."inquirer_first_name" AS "inquirer_first_name", "inquiry"."inquirer_last_name" AS "inquirer_last_name", "inquiry"."inquirer_organization" AS "inquirer_organization", "inquiry"."type_code" AS "inquiry_type_code", "inquiry"."date_submitted_to_alc" AS "date_submitted_to_alc", "inquiry"."local_government_uuid" AS "local_government_uuid", "inquiry"."region_code" AS "inquiry_region_code" FROM "alcs"."inquiry" "inquiry" INNER JOIN "alcs"."inquiry_type" "inquiryType" ON  "inquiry"."type_code" = "inquiryType"."code" AND "inquiryType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "inquiry"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "inquiry"."audit_deleted_date_at" IS NULL`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'inquiry_search_view',
        'SELECT "inquiry"."uuid" AS "inquiry_uuid", "inquiry"."open" AS "open", "inquiryType"."audit_deleted_date_at" AS "inquiryType_audit_deleted_date_at", "inquiryType"."audit_created_at" AS "inquiryType_audit_created_at", "inquiryType"."audit_updated_at" AS "inquiryType_audit_updated_at", "inquiryType"."audit_created_by" AS "inquiryType_audit_created_by", "inquiryType"."audit_updated_by" AS "inquiryType_audit_updated_by", "inquiryType"."label" AS "inquiryType_label", "inquiryType"."code" AS "inquiryType_code", "inquiryType"."description" AS "inquiryType_description", "inquiryType"."short_label" AS "inquiryType_short_label", "inquiryType"."background_color" AS "inquiryType_background_color", "inquiryType"."text_color" AS "inquiryType_text_color", "inquiryType"."html_description" AS "inquiryType_html_description", "localGovernment"."name" AS "local_government_name", "inquiry"."file_number" AS "file_number", "inquiry"."inquirer_first_name" AS "inquirer_first_name", "inquiry"."inquirer_last_name" AS "inquirer_last_name", "inquiry"."inquirer_organization" AS "inquirer_organization", "inquiry"."type_code" AS "inquiry_type_code", "inquiry"."date_submitted_to_alc" AS "date_submitted_to_alc", "inquiry"."local_government_uuid" AS "local_government_uuid", "inquiry"."region_code" AS "inquiry_region_code" FROM "alcs"."inquiry" "inquiry" INNER JOIN "alcs"."inquiry_type" "inquiryType" ON  "inquiry"."type_code" = "inquiryType"."code" AND "inquiryType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "inquiry"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "inquiry"."audit_deleted_date_at" IS NULL',
      ],
    );
  }
}
