import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAppTypeJoin1709063190586 implements MigrationInterface {
  name = 'RemoveAppTypeJoin1709063190586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'application_submission_search_view', 'alcs'],
    );
    await queryRunner.query(
      `DROP VIEW "alcs"."application_submission_search_view"`,
    );
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
      `CREATE VIEW "alcs"."application_submission_search_view" AS SELECT "as2"."uuid" AS "uuid", "as2"."applicant" AS "applicant", "a"."uuid" AS "application_uuid", "localGovernment"."name" AS "local_government_name", "as2"."file_number" AS "file_number", "as2"."local_government_uuid" AS "local_government_uuid", "as2"."type_code" AS "application_type_code", "as2"."is_draft" AS "is_draft", "a"."legacy_id" AS "legacy_id", "a"."date_submitted_to_alc" AS "date_submitted_to_alc", "a"."decision_date" AS "decision_date", "a"."region_code" AS "application_region_code", alcs.get_current_status_for_application_submission_by_uuid("as2"."uuid") AS "status" FROM "alcs"."application_submission" "as2" INNER JOIN "alcs"."application" "a" ON  "a"."file_number" = "as2"."file_number" AND "a"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON "as2"."local_government_uuid" = "localGovernment"."uuid"`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'application_submission_search_view',
        'SELECT "as2"."uuid" AS "uuid", "as2"."applicant" AS "applicant", "a"."uuid" AS "application_uuid", "localGovernment"."name" AS "local_government_name", "as2"."file_number" AS "file_number", "as2"."local_government_uuid" AS "local_government_uuid", "as2"."type_code" AS "application_type_code", "as2"."is_draft" AS "is_draft", "a"."legacy_id" AS "legacy_id", "a"."date_submitted_to_alc" AS "date_submitted_to_alc", "a"."decision_date" AS "decision_date", "a"."region_code" AS "application_region_code", alcs.get_current_status_for_application_submission_by_uuid("as2"."uuid") AS "status" FROM "alcs"."application_submission" "as2" INNER JOIN "alcs"."application" "a" ON  "a"."file_number" = "as2"."file_number" AND "a"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON "as2"."local_government_uuid" = "localGovernment"."uuid"',
      ],
    );
  }
}
