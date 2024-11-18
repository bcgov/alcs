import { MigrationInterface, QueryRunner } from "typeorm";

export class NoiStatusUpdate1731441606374 implements MigrationInterface {
    name = 'NoiStatusUpdate1731441606374'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE VIEW "alcs"."noi_submission_status_search_view" AS SELECT "noi_sub"."file_number" AS "file_number", alcs.get_current_status_for_notice_of_intent_submission_by_uuid("noi_sub"."uuid") AS "status" FROM "alcs"."notice_of_intent_submission" "noi_sub" WHERE ( "noi_sub"."is_draft" IS NOT TRUE ) AND ( "noi_sub"."audit_deleted_date_at" IS NULL )`);
        await queryRunner.query(`INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["alcs","VIEW","noi_submission_status_search_view","SELECT \"noi_sub\".\"file_number\" AS \"file_number\", alcs.get_current_status_for_notice_of_intent_submission_by_uuid(\"noi_sub\".\"uuid\") AS \"status\" FROM \"alcs\".\"notice_of_intent_submission\" \"noi_sub\" WHERE ( \"noi_sub\".\"is_draft\" IS NOT TRUE ) AND ( \"noi_sub\".\"audit_deleted_date_at\" IS NULL )"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","noi_submission_status_search_view","alcs"]);
        await queryRunner.query(`DROP VIEW "alcs"."noi_submission_status_search_view"`);
    }

}
