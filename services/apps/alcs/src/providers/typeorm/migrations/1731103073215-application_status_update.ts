import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplicationStatusUpdate1731103073215 implements MigrationInterface {
    name = 'ApplicationStatusUpdate1731103073215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE VIEW "alcs"."application_submission_status_search_view" AS SELECT "app_sub"."file_number" AS "file_number", alcs.get_current_status_for_application_submission_by_uuid("app_sub"."uuid") AS "status" FROM "alcs"."application_submission" "app_sub" WHERE ( "app_sub"."is_draft" IS NOT TRUE ) AND ( "app_sub"."audit_deleted_date_at" IS NULL )`);
        await queryRunner.query(`INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["alcs","VIEW","application_submission_status_search_view","SELECT \"app_sub\".\"file_number\" AS \"file_number\", alcs.get_current_status_for_application_submission_by_uuid(\"app_sub\".\"uuid\") AS \"status\" FROM \"alcs\".\"application_submission\" \"app_sub\" WHERE ( \"app_sub\".\"is_draft\" IS NOT TRUE ) AND ( \"app_sub\".\"audit_deleted_date_at\" IS NULL )"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","application_submission_status_search_view","alcs"]);
        await queryRunner.query(`DROP VIEW "alcs"."application_submission_status_search_view"`);
    }

}
