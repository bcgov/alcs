import { MigrationInterface, QueryRunner } from 'typeorm';

export class nonApplicationView1693606128323 implements MigrationInterface {
  name = 'nonApplicationView1693606128323';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE VIEW "alcs"."non_application_search_view" AS 
        SELECT
        non_applications."uuid"
        ,non_applications."file_number"
        ,non_applications."applicant" 
        ,non_applications."type"
        ,non_applications."class"
        ,non_applications."local_government_uuid" as "local_government_uuid"
        ,non_applications."card_uuid"
        ,non_applications."board_code"
        FROM
        (
        SELECT
            cov.uuid AS "uuid",
            cov.file_number AS "file_number",
            "applicant",
            NULL AS "type",
            'COV' AS "class",
            cov.local_government_uuid AS "local_government_uuid",
            card.uuid AS "card_uuid",
            board.code AS "board_code"
        FROM
            alcs.covenant cov
        LEFT JOIN alcs.card card ON
            cov.card_uuid = card.uuid AND card.audit_deleted_date_at IS NULL
        LEFT JOIN alcs.board board ON
            board.uuid = card.board_uuid AND board.audit_deleted_date_at IS NULL
        WHERE cov.audit_deleted_date_at IS NULL
        UNION
        SELECT
            planning_review.uuid AS "uuid",
            planning_review.file_number AS "file_number",
            NULL AS "applicant",
            "type",
            'PLAN' AS "class",
            planning_review.local_government_uuid AS "local_government_uuid",
            card.uuid AS "card_uuid",
            board.code AS "board_code"
        FROM
            alcs.planning_review planning_review 
        LEFT JOIN alcs.card card ON
            planning_review.card_uuid = card.uuid AND card.audit_deleted_date_at IS NULL
        LEFT JOIN alcs.board board ON
            board.uuid = card.board_uuid AND board.audit_deleted_date_at IS NULL
        WHERE planning_review.audit_deleted_date_at IS NULL
        ) AS non_applications
`);
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'non_application_search_view',
        'SELECT\n        non_applications."uuid"\n        ,non_applications."file_number"\n        ,non_applications."applicant" \n        ,non_applications."type"\n        ,non_applications."class"\n        ,non_applications."local_government_uuid" as "local_government_uuid"\n        ,non_applications."card_uuid"\n        ,non_applications."board_code"\n        FROM\n        (\n        SELECT\n            cov.uuid AS "uuid",\n            cov.file_number AS "file_number",\n            "applicant",\n            NULL AS "type",\n            \'COV\' AS "class",\n            cov.local_government_uuid AS "local_government_uuid",\n            card.uuid AS "card_uuid",\n            board.code AS "board_code"\n        FROM\n            alcs.covenant cov\n        LEFT JOIN alcs.card card ON\n            cov.card_uuid = card.uuid AND card.audit_deleted_date_at IS NULL\n        LEFT JOIN alcs.board board ON\n            board.uuid = card.board_uuid AND board.audit_deleted_date_at IS NULL\n        WHERE cov.audit_deleted_date_at IS NULL\n        UNION\n        SELECT\n            planning_review.uuid AS "uuid",\n            planning_review.file_number AS "file_number",\n            NULL AS "applicant",\n            "type",\n            \'PLAN\' AS "class",\n            planning_review.local_government_uuid AS "local_government_uuid",\n            card.uuid AS "card_uuid",\n            board.code AS "board_code"\n        FROM\n            alcs.planning_review planning_review \n        LEFT JOIN alcs.card card ON\n            planning_review.card_uuid = card.uuid AND card.audit_deleted_date_at IS NULL\n        LEFT JOIN alcs.board board ON\n            board.uuid = card.board_uuid AND board.audit_deleted_date_at IS NULL\n        WHERE planning_review.audit_deleted_date_at IS NULL\n        ) AS non_applications',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'non_application_search_view', 'alcs'],
    );
    await queryRunner.query(`DROP VIEW "alcs"."non_application_search_view"`);
  }
}
