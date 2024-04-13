import { MigrationInterface, QueryRunner } from "typeorm";

export class legacyidNoi1697670803814 implements MigrationInterface {
    name = 'legacyidNoi1697670803814'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","notice_of_intent_submission_search_view","alcs"]);
        await queryRunner.query(`DROP VIEW "alcs"."notice_of_intent_submission_search_view"`);
        await queryRunner.query(`DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","application_submission_search_view","alcs"]);
        await queryRunner.query(`DROP VIEW "alcs"."application_submission_search_view"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent" ADD "legacy_id" text`);
        await queryRunner.query(`COMMENT ON COLUMN "alcs"."notice_of_intent"."legacy_id" IS 'NOI Id that is applicable only to paper version applications from 70s - 80s'`);
        await queryRunner.query(`ALTER TABLE "alcs"."document" ALTER COLUMN "system" SET DEFAULT 'ALC'`);
        await queryRunner.query(`CREATE VIEW "alcs"."notice_of_intent_submission_search_view" AS SELECT "nois"."uuid" AS "uuid", "nois"."applicant" AS "applicant", "noi"."uuid" AS "notice_of_intent_uuid", "noticeOfIntentType"."audit_deleted_date_at" AS "noticeOfIntentType_audit_deleted_date_at", "noticeOfIntentType"."audit_created_at" AS "noticeOfIntentType_audit_created_at", "noticeOfIntentType"."audit_updated_at" AS "noticeOfIntentType_audit_updated_at", "noticeOfIntentType"."audit_created_by" AS "noticeOfIntentType_audit_created_by", "noticeOfIntentType"."audit_updated_by" AS "noticeOfIntentType_audit_updated_by", "noticeOfIntentType"."label" AS "noticeOfIntentType_label", "noticeOfIntentType"."code" AS "noticeOfIntentType_code", "noticeOfIntentType"."description" AS "noticeOfIntentType_description", "noticeOfIntentType"."short_label" AS "noticeOfIntentType_short_label", "noticeOfIntentType"."background_color" AS "noticeOfIntentType_background_color", "noticeOfIntentType"."text_color" AS "noticeOfIntentType_text_color", "noticeOfIntentType"."html_description" AS "noticeOfIntentType_html_description", "noticeOfIntentType"."portal_label" AS "noticeOfIntentType_portal_label", "localGovernment"."name" AS "local_government_name", "nois"."file_number" AS "file_number", "nois"."local_government_uuid" AS "local_government_uuid", "nois"."type_code" AS "notice_of_intent_type_code", "nois"."is_draft" AS "is_draft", "noi"."date_submitted_to_alc" AS "date_submitted_to_alc", "noi"."legacy_id" AS "legacy_id", "noi"."decision_date" AS "decision_date", "noi"."region_code" AS "notice_of_intent_region_code", alcs.get_current_status_for_notice_of_intent_submission_by_uuid("nois"."uuid") AS "status" FROM "alcs"."notice_of_intent_submission" "nois" INNER JOIN "alcs"."notice_of_intent" "noi" ON  "noi"."file_number" = "nois"."file_number" AND "noi"."audit_deleted_date_at" IS NULL  INNER JOIN "alcs"."notice_of_intent_type" "noticeOfIntentType" ON  "nois"."type_code" = "noticeOfIntentType"."code" AND "noticeOfIntentType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "nois"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "nois"."audit_deleted_date_at" IS NULL`);
        await queryRunner.query(`INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["alcs","VIEW","notice_of_intent_submission_search_view","SELECT \"nois\".\"uuid\" AS \"uuid\", \"nois\".\"applicant\" AS \"applicant\", \"noi\".\"uuid\" AS \"notice_of_intent_uuid\", \"noticeOfIntentType\".\"audit_deleted_date_at\" AS \"noticeOfIntentType_audit_deleted_date_at\", \"noticeOfIntentType\".\"audit_created_at\" AS \"noticeOfIntentType_audit_created_at\", \"noticeOfIntentType\".\"audit_updated_at\" AS \"noticeOfIntentType_audit_updated_at\", \"noticeOfIntentType\".\"audit_created_by\" AS \"noticeOfIntentType_audit_created_by\", \"noticeOfIntentType\".\"audit_updated_by\" AS \"noticeOfIntentType_audit_updated_by\", \"noticeOfIntentType\".\"label\" AS \"noticeOfIntentType_label\", \"noticeOfIntentType\".\"code\" AS \"noticeOfIntentType_code\", \"noticeOfIntentType\".\"description\" AS \"noticeOfIntentType_description\", \"noticeOfIntentType\".\"short_label\" AS \"noticeOfIntentType_short_label\", \"noticeOfIntentType\".\"background_color\" AS \"noticeOfIntentType_background_color\", \"noticeOfIntentType\".\"text_color\" AS \"noticeOfIntentType_text_color\", \"noticeOfIntentType\".\"html_description\" AS \"noticeOfIntentType_html_description\", \"noticeOfIntentType\".\"portal_label\" AS \"noticeOfIntentType_portal_label\", \"localGovernment\".\"name\" AS \"local_government_name\", \"nois\".\"file_number\" AS \"file_number\", \"nois\".\"local_government_uuid\" AS \"local_government_uuid\", \"nois\".\"type_code\" AS \"notice_of_intent_type_code\", \"nois\".\"is_draft\" AS \"is_draft\", \"noi\".\"date_submitted_to_alc\" AS \"date_submitted_to_alc\", \"noi\".\"legacy_id\" AS \"legacy_id\", \"noi\".\"decision_date\" AS \"decision_date\", \"noi\".\"region_code\" AS \"notice_of_intent_region_code\", alcs.get_current_status_for_notice_of_intent_submission_by_uuid(\"nois\".\"uuid\") AS \"status\" FROM \"alcs\".\"notice_of_intent_submission\" \"nois\" INNER JOIN \"alcs\".\"notice_of_intent\" \"noi\" ON  \"noi\".\"file_number\" = \"nois\".\"file_number\" AND \"noi\".\"audit_deleted_date_at\" IS NULL  INNER JOIN \"alcs\".\"notice_of_intent_type\" \"noticeOfIntentType\" ON  \"nois\".\"type_code\" = \"noticeOfIntentType\".\"code\" AND \"noticeOfIntentType\".\"audit_deleted_date_at\" IS NULL  LEFT JOIN \"alcs\".\"local_government\" \"localGovernment\" ON  \"nois\".\"local_government_uuid\" = \"localGovernment\".\"uuid\" AND \"localGovernment\".\"audit_deleted_date_at\" IS NULL WHERE \"nois\".\"audit_deleted_date_at\" IS NULL"]);
        await queryRunner.query(`CREATE VIEW "alcs"."application_submission_search_view" AS SELECT "as2"."uuid" AS "uuid", "as2"."applicant" AS "applicant", "a"."uuid" AS "application_uuid", "applicationType"."audit_deleted_date_at" AS "applicationType_audit_deleted_date_at", "applicationType"."audit_created_at" AS "applicationType_audit_created_at", "applicationType"."audit_updated_at" AS "applicationType_audit_updated_at", "applicationType"."audit_created_by" AS "applicationType_audit_created_by", "applicationType"."audit_updated_by" AS "applicationType_audit_updated_by", "applicationType"."label" AS "applicationType_label", "applicationType"."code" AS "applicationType_code", "applicationType"."description" AS "applicationType_description", "applicationType"."short_label" AS "applicationType_short_label", "applicationType"."background_color" AS "applicationType_background_color", "applicationType"."text_color" AS "applicationType_text_color", "applicationType"."html_description" AS "applicationType_html_description", "applicationType"."portal_label" AS "applicationType_portal_label", "localGovernment"."name" AS "local_government_name", "as2"."file_number" AS "file_number", "as2"."local_government_uuid" AS "local_government_uuid", "as2"."type_code" AS "application_type_code", "as2"."is_draft" AS "is_draft", "a"."legacy_id" AS "legacy_id", "a"."date_submitted_to_alc" AS "date_submitted_to_alc", "a"."decision_date" AS "decision_date", "a"."region_code" AS "application_region_code", alcs.get_current_status_for_application_submission_by_uuid("as2"."uuid") AS "status" FROM "alcs"."application_submission" "as2" INNER JOIN "alcs"."application" "a" ON  "a"."file_number" = "as2"."file_number" AND "a"."audit_deleted_date_at" IS NULL  INNER JOIN "alcs"."application_type" "applicationType" ON  "as2"."type_code" = "applicationType"."code" AND "applicationType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "as2"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "as2"."audit_deleted_date_at" IS NULL`);
        await queryRunner.query(`INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["alcs","VIEW","application_submission_search_view","SELECT \"as2\".\"uuid\" AS \"uuid\", \"as2\".\"applicant\" AS \"applicant\", \"a\".\"uuid\" AS \"application_uuid\", \"applicationType\".\"audit_deleted_date_at\" AS \"applicationType_audit_deleted_date_at\", \"applicationType\".\"audit_created_at\" AS \"applicationType_audit_created_at\", \"applicationType\".\"audit_updated_at\" AS \"applicationType_audit_updated_at\", \"applicationType\".\"audit_created_by\" AS \"applicationType_audit_created_by\", \"applicationType\".\"audit_updated_by\" AS \"applicationType_audit_updated_by\", \"applicationType\".\"label\" AS \"applicationType_label\", \"applicationType\".\"code\" AS \"applicationType_code\", \"applicationType\".\"description\" AS \"applicationType_description\", \"applicationType\".\"short_label\" AS \"applicationType_short_label\", \"applicationType\".\"background_color\" AS \"applicationType_background_color\", \"applicationType\".\"text_color\" AS \"applicationType_text_color\", \"applicationType\".\"html_description\" AS \"applicationType_html_description\", \"applicationType\".\"portal_label\" AS \"applicationType_portal_label\", \"localGovernment\".\"name\" AS \"local_government_name\", \"as2\".\"file_number\" AS \"file_number\", \"as2\".\"local_government_uuid\" AS \"local_government_uuid\", \"as2\".\"type_code\" AS \"application_type_code\", \"as2\".\"is_draft\" AS \"is_draft\", \"a\".\"legacy_id\" AS \"legacy_id\", \"a\".\"date_submitted_to_alc\" AS \"date_submitted_to_alc\", \"a\".\"decision_date\" AS \"decision_date\", \"a\".\"region_code\" AS \"application_region_code\", alcs.get_current_status_for_application_submission_by_uuid(\"as2\".\"uuid\") AS \"status\" FROM \"alcs\".\"application_submission\" \"as2\" INNER JOIN \"alcs\".\"application\" \"a\" ON  \"a\".\"file_number\" = \"as2\".\"file_number\" AND \"a\".\"audit_deleted_date_at\" IS NULL  INNER JOIN \"alcs\".\"application_type\" \"applicationType\" ON  \"as2\".\"type_code\" = \"applicationType\".\"code\" AND \"applicationType\".\"audit_deleted_date_at\" IS NULL  LEFT JOIN \"alcs\".\"local_government\" \"localGovernment\" ON  \"as2\".\"local_government_uuid\" = \"localGovernment\".\"uuid\" AND \"localGovernment\".\"audit_deleted_date_at\" IS NULL WHERE \"as2\".\"audit_deleted_date_at\" IS NULL"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","application_submission_search_view","alcs"]);
        await queryRunner.query(`DROP VIEW "alcs"."application_submission_search_view"`);
        await queryRunner.query(`DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","notice_of_intent_submission_search_view","alcs"]);
        await queryRunner.query(`DROP VIEW "alcs"."notice_of_intent_submission_search_view"`);
        await queryRunner.query(`ALTER TABLE "alcs"."document" ALTER COLUMN "system" SET DEFAULT 'ALCS'`);
        await queryRunner.query(`COMMENT ON COLUMN "alcs"."notice_of_intent"."legacy_id" IS 'NOI Id that is applicable only to paper version applications from 70s - 80s'`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "legacy_id"`);
        await queryRunner.query(`CREATE VIEW "alcs"."application_submission_search_view" AS SELECT "as2"."uuid" AS "uuid", "as2"."applicant" AS "applicant", "a"."uuid" AS "application_uuid", "applicationType"."audit_deleted_date_at" AS "applicationType_audit_deleted_date_at", "applicationType"."audit_created_at" AS "applicationType_audit_created_at", "applicationType"."audit_updated_at" AS "applicationType_audit_updated_at", "applicationType"."audit_created_by" AS "applicationType_audit_created_by", "applicationType"."audit_updated_by" AS "applicationType_audit_updated_by", "applicationType"."label" AS "applicationType_label", "applicationType"."code" AS "applicationType_code", "applicationType"."description" AS "applicationType_description", "applicationType"."short_label" AS "applicationType_short_label", "applicationType"."background_color" AS "applicationType_background_color", "applicationType"."text_color" AS "applicationType_text_color", "applicationType"."html_description" AS "applicationType_html_description", "applicationType"."portal_label" AS "applicationType_portal_label", "localGovernment"."name" AS "local_government_name", "as2"."file_number" AS "file_number", "as2"."local_government_uuid" AS "local_government_uuid", "as2"."type_code" AS "application_type_code", "as2"."is_draft" AS "is_draft", "a"."legacy_id" AS "legacy_id", "a"."date_submitted_to_alc" AS "date_submitted_to_alc", "a"."decision_date" AS "decision_date", "a"."region_code" AS "application_region_code", alcs.get_current_status_for_submission_by_uuid("as2"."uuid") AS "status" FROM "alcs"."application_submission" "as2" INNER JOIN "alcs"."application" "a" ON  "a"."file_number" = "as2"."file_number" AND "a"."audit_deleted_date_at" IS NULL  INNER JOIN "alcs"."application_type" "applicationType" ON  "as2"."type_code" = "applicationType"."code" AND "applicationType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "as2"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "as2"."audit_deleted_date_at" IS NULL`);
        await queryRunner.query(`INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["alcs","VIEW","application_submission_search_view","SELECT \"as2\".\"uuid\" AS \"uuid\", \"as2\".\"applicant\" AS \"applicant\", \"a\".\"uuid\" AS \"application_uuid\", \"applicationType\".\"audit_deleted_date_at\" AS \"applicationType_audit_deleted_date_at\", \"applicationType\".\"audit_created_at\" AS \"applicationType_audit_created_at\", \"applicationType\".\"audit_updated_at\" AS \"applicationType_audit_updated_at\", \"applicationType\".\"audit_created_by\" AS \"applicationType_audit_created_by\", \"applicationType\".\"audit_updated_by\" AS \"applicationType_audit_updated_by\", \"applicationType\".\"label\" AS \"applicationType_label\", \"applicationType\".\"code\" AS \"applicationType_code\", \"applicationType\".\"description\" AS \"applicationType_description\", \"applicationType\".\"short_label\" AS \"applicationType_short_label\", \"applicationType\".\"background_color\" AS \"applicationType_background_color\", \"applicationType\".\"text_color\" AS \"applicationType_text_color\", \"applicationType\".\"html_description\" AS \"applicationType_html_description\", \"applicationType\".\"portal_label\" AS \"applicationType_portal_label\", \"localGovernment\".\"name\" AS \"local_government_name\", \"as2\".\"file_number\" AS \"file_number\", \"as2\".\"local_government_uuid\" AS \"local_government_uuid\", \"as2\".\"type_code\" AS \"application_type_code\", \"as2\".\"is_draft\" AS \"is_draft\", \"a\".\"legacy_id\" AS \"legacy_id\", \"a\".\"date_submitted_to_alc\" AS \"date_submitted_to_alc\", \"a\".\"decision_date\" AS \"decision_date\", \"a\".\"region_code\" AS \"application_region_code\", alcs.get_current_status_for_submission_by_uuid(\"as2\".\"uuid\") AS \"status\" FROM \"alcs\".\"application_submission\" \"as2\" INNER JOIN \"alcs\".\"application\" \"a\" ON  \"a\".\"file_number\" = \"as2\".\"file_number\" AND \"a\".\"audit_deleted_date_at\" IS NULL  INNER JOIN \"alcs\".\"application_type\" \"applicationType\" ON  \"as2\".\"type_code\" = \"applicationType\".\"code\" AND \"applicationType\".\"audit_deleted_date_at\" IS NULL  LEFT JOIN \"alcs\".\"local_government\" \"localGovernment\" ON  \"as2\".\"local_government_uuid\" = \"localGovernment\".\"uuid\" AND \"localGovernment\".\"audit_deleted_date_at\" IS NULL WHERE \"as2\".\"audit_deleted_date_at\" IS NULL"]);
        await queryRunner.query(`CREATE VIEW "alcs"."notice_of_intent_submission_search_view" AS SELECT "nois"."uuid" AS "uuid", "nois"."applicant" AS "applicant", "noi"."uuid" AS "notice_of_intent_uuid", "noticeOfIntentType"."audit_deleted_date_at" AS "noticeOfIntentType_audit_deleted_date_at", "noticeOfIntentType"."audit_created_at" AS "noticeOfIntentType_audit_created_at", "noticeOfIntentType"."audit_updated_at" AS "noticeOfIntentType_audit_updated_at", "noticeOfIntentType"."audit_created_by" AS "noticeOfIntentType_audit_created_by", "noticeOfIntentType"."audit_updated_by" AS "noticeOfIntentType_audit_updated_by", "noticeOfIntentType"."label" AS "noticeOfIntentType_label", "noticeOfIntentType"."code" AS "noticeOfIntentType_code", "noticeOfIntentType"."description" AS "noticeOfIntentType_description", "noticeOfIntentType"."short_label" AS "noticeOfIntentType_short_label", "noticeOfIntentType"."html_description" AS "noticeOfIntentType_html_description", "noticeOfIntentType"."portal_label" AS "noticeOfIntentType_portal_label", "localGovernment"."name" AS "local_government_name", "nois"."file_number" AS "file_number", "nois"."local_government_uuid" AS "local_government_uuid", "nois"."type_code" AS "notice_of_intent_type_code", "nois"."is_draft" AS "is_draft", "noi"."date_submitted_to_alc" AS "date_submitted_to_alc", "noi"."decision_date" AS "decision_date", "noi"."region_code" AS "notice_of_intent_region_code", alcs.get_current_status_for_notice_of_intent_submission_by_uuid("nois"."uuid") AS "status" FROM "alcs"."notice_of_intent_submission" "nois" INNER JOIN "alcs"."notice_of_intent" "noi" ON  "noi"."file_number" = "nois"."file_number" AND "noi"."audit_deleted_date_at" IS NULL  INNER JOIN "alcs"."notice_of_intent_type" "noticeOfIntentType" ON  "nois"."type_code" = "noticeOfIntentType"."code" AND "noticeOfIntentType"."audit_deleted_date_at" IS NULL  LEFT JOIN "alcs"."local_government" "localGovernment" ON  "nois"."local_government_uuid" = "localGovernment"."uuid" AND "localGovernment"."audit_deleted_date_at" IS NULL WHERE "nois"."audit_deleted_date_at" IS NULL`);
        await queryRunner.query(`INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["alcs","VIEW","notice_of_intent_submission_search_view","SELECT \"nois\".\"uuid\" AS \"uuid\", \"nois\".\"applicant\" AS \"applicant\", \"noi\".\"uuid\" AS \"notice_of_intent_uuid\", \"noticeOfIntentType\".\"audit_deleted_date_at\" AS \"noticeOfIntentType_audit_deleted_date_at\", \"noticeOfIntentType\".\"audit_created_at\" AS \"noticeOfIntentType_audit_created_at\", \"noticeOfIntentType\".\"audit_updated_at\" AS \"noticeOfIntentType_audit_updated_at\", \"noticeOfIntentType\".\"audit_created_by\" AS \"noticeOfIntentType_audit_created_by\", \"noticeOfIntentType\".\"audit_updated_by\" AS \"noticeOfIntentType_audit_updated_by\", \"noticeOfIntentType\".\"label\" AS \"noticeOfIntentType_label\", \"noticeOfIntentType\".\"code\" AS \"noticeOfIntentType_code\", \"noticeOfIntentType\".\"description\" AS \"noticeOfIntentType_description\", \"noticeOfIntentType\".\"short_label\" AS \"noticeOfIntentType_short_label\", \"noticeOfIntentType\".\"html_description\" AS \"noticeOfIntentType_html_description\", \"noticeOfIntentType\".\"portal_label\" AS \"noticeOfIntentType_portal_label\", \"localGovernment\".\"name\" AS \"local_government_name\", \"nois\".\"file_number\" AS \"file_number\", \"nois\".\"local_government_uuid\" AS \"local_government_uuid\", \"nois\".\"type_code\" AS \"notice_of_intent_type_code\", \"nois\".\"is_draft\" AS \"is_draft\", \"noi\".\"date_submitted_to_alc\" AS \"date_submitted_to_alc\", \"noi\".\"decision_date\" AS \"decision_date\", \"noi\".\"region_code\" AS \"notice_of_intent_region_code\", alcs.get_current_status_for_notice_of_intent_submission_by_uuid(\"nois\".\"uuid\") AS \"status\" FROM \"alcs\".\"notice_of_intent_submission\" \"nois\" INNER JOIN \"alcs\".\"notice_of_intent\" \"noi\" ON  \"noi\".\"file_number\" = \"nois\".\"file_number\" AND \"noi\".\"audit_deleted_date_at\" IS NULL  INNER JOIN \"alcs\".\"notice_of_intent_type\" \"noticeOfIntentType\" ON  \"nois\".\"type_code\" = \"noticeOfIntentType\".\"code\" AND \"noticeOfIntentType\".\"audit_deleted_date_at\" IS NULL  LEFT JOIN \"alcs\".\"local_government\" \"localGovernment\" ON  \"nois\".\"local_government_uuid\" = \"localGovernment\".\"uuid\" AND \"localGovernment\".\"audit_deleted_date_at\" IS NULL WHERE \"nois\".\"audit_deleted_date_at\" IS NULL"]);
    }

}