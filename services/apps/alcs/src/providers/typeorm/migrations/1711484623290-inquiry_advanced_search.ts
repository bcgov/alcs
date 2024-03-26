import { MigrationInterface, QueryRunner } from 'typeorm';

export class InquiryAdvancedSearch1711484623290 implements MigrationInterface {
  name = 'InquiryAdvancedSearch1711484623290';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'inquiry_search_view', 'alcs'],
    );
    await queryRunner.query(`DROP VIEW "alcs"."inquiry_search_view"`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" DROP CONSTRAINT "unique_doc_app_id"`,
    );
    await queryRunner.query(
      `CREATE VIEW "alcs"."inquiry_search_view" AS SELECT "inquiry"."uuid" AS "inquiry_uuid", "inquiry"."open" AS "open", "inquiryType"."audit_deleted_date_at" AS "inquiryType_audit_deleted_date_at", "inquiryType"."audit_created_at" AS "inquiryType_audit_created_at", "inquiryType"."audit_updated_at" AS "inquiryType_audit_updated_at", "inquiryType"."audit_created_by" AS "inquiryType_audit_created_by", "inquiryType"."audit_updated_by" AS "inquiryType_audit_updated_by", "inquiryType"."label" AS "inquiryType_label", "inquiryType"."code" AS "inquiryType_code", "inquiryType"."description" AS "inquiryType_description", "inquiryType"."short_label" AS "inquiryType_short_label", "inquiryType"."background_color" AS "inquiryType_background_color", "inquiryType"."text_color" AS "inquiryType_text_color", "inquiryType"."html_description" AS "inquiryType_html_description", "localGovernment"."name" AS "local_government_name", "inquiry"."file_number" AS "file_number", "inquiry"."inquirer_first_name" AS "inquirer_first_name", "inquiry"."inquirer_last_name" AS "inquirer_last_name", "inquiry"."inquirer_organization" AS "inquirer_organization", "inquiry"."type_code" AS "inquiry_type_code", "inquiry"."date_submitted_to_alc" AS "date_submitted_to_alc", "inquiry"."local_government_uuid" AS "local_government_uuid", "inquiry"."region_code" AS "inquiry_region_code", "inquiry"."inquirer_first_name" || ' ' || "inquiry"."inquirer_last_name" AS "inquirer_name" FROM "alcs"."inquiry" "inquiry" INNER JOIN "alcs"."inquiry_type" "inquiryType" ON  "inquiry"."type_code" = "inquiryType"."code" AND "inquiryType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "inquiry"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "inquiry"."audit_deleted_date_at" IS NULL`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'inquiry_search_view',
        'SELECT "inquiry"."uuid" AS "inquiry_uuid", "inquiry"."open" AS "open", "inquiryType"."audit_deleted_date_at" AS "inquiryType_audit_deleted_date_at", "inquiryType"."audit_created_at" AS "inquiryType_audit_created_at", "inquiryType"."audit_updated_at" AS "inquiryType_audit_updated_at", "inquiryType"."audit_created_by" AS "inquiryType_audit_created_by", "inquiryType"."audit_updated_by" AS "inquiryType_audit_updated_by", "inquiryType"."label" AS "inquiryType_label", "inquiryType"."code" AS "inquiryType_code", "inquiryType"."description" AS "inquiryType_description", "inquiryType"."short_label" AS "inquiryType_short_label", "inquiryType"."background_color" AS "inquiryType_background_color", "inquiryType"."text_color" AS "inquiryType_text_color", "inquiryType"."html_description" AS "inquiryType_html_description", "localGovernment"."name" AS "local_government_name", "inquiry"."file_number" AS "file_number", "inquiry"."inquirer_first_name" AS "inquirer_first_name", "inquiry"."inquirer_last_name" AS "inquirer_last_name", "inquiry"."inquirer_organization" AS "inquirer_organization", "inquiry"."type_code" AS "inquiry_type_code", "inquiry"."date_submitted_to_alc" AS "date_submitted_to_alc", "inquiry"."local_government_uuid" AS "local_government_uuid", "inquiry"."region_code" AS "inquiry_region_code", "inquiry"."inquirer_first_name" || \' \' || "inquiry"."inquirer_last_name" AS "inquirer_name" FROM "alcs"."inquiry" "inquiry" INNER JOIN "alcs"."inquiry_type" "inquiryType" ON  "inquiry"."type_code" = "inquiryType"."code" AND "inquiryType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "inquiry"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "inquiry"."audit_deleted_date_at" IS NULL',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'inquiry_search_view', 'alcs'],
    );
    await queryRunner.query(`DROP VIEW "alcs"."inquiry_search_view"`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" ADD CONSTRAINT "unique_doc_app_id" UNIQUE ("oats_document_id", "oats_application_id")`,
    );
    await queryRunner.query(
      `CREATE VIEW "alcs"."inquiry_search_view" AS SELECT "inquiry"."uuid" AS "inquiry_uuid", "inquiryType"."audit_deleted_date_at" AS "inquiryType_audit_deleted_date_at", "inquiryType"."audit_created_at" AS "inquiryType_audit_created_at", "inquiryType"."audit_updated_at" AS "inquiryType_audit_updated_at", "inquiryType"."audit_created_by" AS "inquiryType_audit_created_by", "inquiryType"."audit_updated_by" AS "inquiryType_audit_updated_by", "inquiryType"."label" AS "inquiryType_label", "inquiryType"."code" AS "inquiryType_code", "inquiryType"."description" AS "inquiryType_description", "inquiryType"."short_label" AS "inquiryType_short_label", "inquiryType"."background_color" AS "inquiryType_background_color", "inquiryType"."text_color" AS "inquiryType_text_color", "inquiryType"."html_description" AS "inquiryType_html_description", "localGovernment"."name" AS "local_government_name", "inquiry"."file_number" AS "file_number", "inquiry"."inquirer_first_name" AS "inquirer_first_name", "inquiry"."inquirer_last_name" AS "inquirer_last_name", "inquiry"."type_code" AS "inquiry_type_code", "inquiry"."date_submitted_to_alc" AS "date_submitted_to_alc", "inquiry"."local_government_uuid" AS "local_government_uuid", "inquiry"."region_code" AS "inquiry_region_code", "inquiry"."inquirer_first_name" || ' ' || "inquiry"."inquirer_last_name" AS "inquirer_name" FROM "alcs"."inquiry" "inquiry" INNER JOIN "alcs"."inquiry_type" "inquiryType" ON  "inquiry"."type_code" = "inquiryType"."code" AND "inquiryType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "inquiry"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "inquiry"."audit_deleted_date_at" IS NULL`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'inquiry_search_view',
        'SELECT "inquiry"."uuid" AS "inquiry_uuid", "inquiryType"."audit_deleted_date_at" AS "inquiryType_audit_deleted_date_at", "inquiryType"."audit_created_at" AS "inquiryType_audit_created_at", "inquiryType"."audit_updated_at" AS "inquiryType_audit_updated_at", "inquiryType"."audit_created_by" AS "inquiryType_audit_created_by", "inquiryType"."audit_updated_by" AS "inquiryType_audit_updated_by", "inquiryType"."label" AS "inquiryType_label", "inquiryType"."code" AS "inquiryType_code", "inquiryType"."description" AS "inquiryType_description", "inquiryType"."short_label" AS "inquiryType_short_label", "inquiryType"."background_color" AS "inquiryType_background_color", "inquiryType"."text_color" AS "inquiryType_text_color", "inquiryType"."html_description" AS "inquiryType_html_description", "localGovernment"."name" AS "local_government_name", "inquiry"."file_number" AS "file_number", "inquiry"."inquirer_first_name" AS "inquirer_first_name", "inquiry"."inquirer_last_name" AS "inquirer_last_name", "inquiry"."type_code" AS "inquiry_type_code", "inquiry"."date_submitted_to_alc" AS "date_submitted_to_alc", "inquiry"."local_government_uuid" AS "local_government_uuid", "inquiry"."region_code" AS "inquiry_region_code", "inquiry"."inquirer_first_name" || \' \' || "inquiry"."inquirer_last_name" AS "inquirer_name" FROM "alcs"."inquiry" "inquiry" INNER JOIN "alcs"."inquiry_type" "inquiryType" ON  "inquiry"."type_code" = "inquiryType"."code" AND "inquiryType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "inquiry"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "inquiry"."audit_deleted_date_at" IS NULL',
      ],
    );
  }
}
