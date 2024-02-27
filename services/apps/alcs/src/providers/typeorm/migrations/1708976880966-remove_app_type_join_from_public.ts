import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAppTypeJoinFromPublic1708976880966
  implements MigrationInterface
{
  name = 'RemoveAppTypeJoinFromPublic1708976880966';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'public_application_submission_search_view', 'alcs'],
    );
    await queryRunner.query(
      `DROP VIEW "alcs"."public_application_submission_search_view"`,
    );
    await queryRunner.query(`CREATE VIEW "alcs"."public_application_submission_search_view" AS 
    SELECT
      app_sub.uuid,
      app_sub.applicant,
      app.uuid AS application_uuid,
      "localGovernment".name AS local_government_name,
      app_sub.file_number,
      app_sub.local_government_uuid,
      app_sub.type_code AS application_type_code,
      app.date_submitted_to_alc,
      app.decision_date,
      decision_date.outcome,
      decision_date.dest_rank,
      app.region_code AS application_region_code,
      GREATEST(status_link.effective_date, decision_date.date) AS last_update,
      alcs.get_current_status_for_application_submission_by_uuid(app_sub.uuid) AS status
    FROM
      alcs.application_submission app_sub
      JOIN alcs.application app ON app.file_number :: text = app_sub.file_number :: text
      AND app.hide_from_portal = false
      AND app.audit_deleted_date_at IS NULL
      LEFT JOIN alcs.local_government "localGovernment" ON app_sub.local_government_uuid = "localGovernment".uuid
      AND "localGovernment".audit_deleted_date_at IS NULL
      LEFT JOIN (
        SELECT
          max(status_link_1.effective_date) AS effective_date,
          status_link_1.submission_uuid
        FROM
          alcs.application_submission_to_submission_status status_link_1
        GROUP BY
          status_link_1.submission_uuid
      ) status_link ON status_link.submission_uuid = app_sub.uuid
      LEFT JOIN (
        SELECT
          DISTINCT ON (decisions.applicationuuid) decisions.decisiondate AS date,
          decisions.outcome,
          decisions.dest_rank,
          decisions.applicationuuid AS application_uuid
        FROM
          (
            SELECT
              decision.outcome_code AS outcome,
              decision.date AS decisiondate,
              decision.application_uuid AS applicationuuid,
              rank() OVER (
                PARTITION BY decision.application_uuid
                ORDER BY
                  decision.date DESC,
                  decision.audit_created_at DESC
              ) AS dest_rank
            FROM
              alcs.application_decision decision
            WHERE
              decision.is_draft = false
              AND decision.audit_deleted_date_at IS NULL
          ) decisions
        WHERE
          decisions.dest_rank = 1
      ) decision_date ON decision_date.application_uuid = app.uuid
    WHERE
      app_sub.is_draft = false
      AND app.date_received_all_items IS NOT NULL
      AND app.date_received_all_items <= now()
      AND (
        alcs.get_current_status_for_application_submission_by_uuid(app_sub.uuid) ->> 'status_type_code' :: text
      ) <> 'CANC' :: text
      AND app_sub.audit_deleted_date_at IS NULL;
  `);
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'public_application_submission_search_view',
        'SELECT\n      app_sub.uuid,\n      app_sub.applicant,\n      app.uuid AS application_uuid,\n      "localGovernment".name AS local_government_name,\n      app_sub.file_number,\n      app_sub.local_government_uuid,\n      app_sub.type_code AS application_type_code,\n      app.date_submitted_to_alc,\n      app.decision_date,\n      decision_date.outcome,\n      decision_date.dest_rank,\n      app.region_code AS application_region_code,\n      GREATEST(status_link.effective_date, decision_date.date) AS last_update,\n      alcs.get_current_status_for_application_submission_by_uuid(app_sub.uuid) AS status\n    FROM\n      alcs.application_submission app_sub\n      JOIN alcs.application app ON app.file_number :: text = app_sub.file_number :: text\n      AND app.hide_from_portal = false\n      AND app.audit_deleted_date_at IS NULL\n      LEFT JOIN alcs.local_government "localGovernment" ON app_sub.local_government_uuid = "localGovernment".uuid\n      AND "localGovernment".audit_deleted_date_at IS NULL\n      LEFT JOIN (\n        SELECT\n          max(status_link_1.effective_date) AS effective_date,\n          status_link_1.submission_uuid\n        FROM\n          alcs.application_submission_to_submission_status status_link_1\n        GROUP BY\n          status_link_1.submission_uuid\n      ) status_link ON status_link.submission_uuid = app_sub.uuid\n      LEFT JOIN (\n        SELECT\n          DISTINCT ON (decisions.applicationuuid) decisions.decisiondate AS date,\n          decisions.outcome,\n          decisions.dest_rank,\n          decisions.applicationuuid AS application_uuid\n        FROM\n          (\n            SELECT\n              decision.outcome_code AS outcome,\n              decision.date AS decisiondate,\n              decision.application_uuid AS applicationuuid,\n              rank() OVER (\n                PARTITION BY decision.application_uuid\n                ORDER BY\n                  decision.date DESC,\n                  decision.audit_created_at DESC\n              ) AS dest_rank\n            FROM\n              alcs.application_decision decision\n            WHERE\n              decision.is_draft = false\n              AND decision.audit_deleted_date_at IS NULL\n          ) decisions\n        WHERE\n          decisions.dest_rank = 1\n      ) decision_date ON decision_date.application_uuid = app.uuid\n    WHERE\n      app_sub.is_draft = false\n      AND app.date_received_all_items IS NOT NULL\n      AND app.date_received_all_items <= now()\n      AND (\n        alcs.get_current_status_for_application_submission_by_uuid(app_sub.uuid) ->> \'status_type_code\' :: text\n      ) <> \'CANC\' :: text\n      AND app_sub.audit_deleted_date_at IS NULL;',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'public_application_submission_search_view', 'alcs'],
    );
    await queryRunner.query(
      `DROP VIEW "alcs"."public_application_submission_search_view"`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'public_application_submission_search_view',
        'SELECT\n    app_sub.uuid,\n    app_sub.applicant,\n    app.uuid AS application_uuid,\n    "applicationType".audit_deleted_date_at AS "applicationType_audit_deleted_date_at",\n    "applicationType".audit_created_at AS "applicationType_audit_created_at",\n    "applicationType".audit_updated_at AS "applicationType_audit_updated_at",\n    "applicationType".audit_created_by AS "applicationType_audit_created_by",\n    "applicationType".audit_updated_by AS "applicationType_audit_updated_by",\n    "applicationType".label AS "applicationType_label",\n    "applicationType".code AS "applicationType_code",\n    "applicationType".description AS "applicationType_description",\n    "applicationType".short_label AS "applicationType_short_label",\n    "applicationType".background_color AS "applicationType_background_color",\n    "applicationType".text_color AS "applicationType_text_color",\n    "applicationType".html_description AS "applicationType_html_description",\n    "applicationType".portal_label AS "applicationType_portal_label",\n    "applicationType".portal_order AS "applicationType_portal_order",\n    "applicationType".requires_government_review AS "applicationType_requires_government_review",\n    "applicationType".alc_fee_amount AS "applicationType_alc_fee_amount",\n    "applicationType".government_fee_amount AS "applicationType_government_fee_amount",\n    "localGovernment".name AS local_government_name,\n    app_sub.file_number,\n    app_sub.local_government_uuid,\n    app_sub.type_code AS application_type_code,\n    app.date_submitted_to_alc,\n    app.decision_date,\n    decision_date.outcome,\n    decision_date.dest_rank,\n    app.region_code AS application_region_code,\n    GREATEST(status_link.effective_date, decision_date.date) AS last_update,\n    alcs.get_current_status_for_application_submission_by_uuid(app_sub.uuid) AS status\n  FROM\n    alcs.application_submission app_sub\n    JOIN alcs.application app ON app.file_number :: text = app_sub.file_number :: text\n    AND app.hide_from_portal = false\n    AND app.audit_deleted_date_at IS NULL\n    JOIN alcs.application_type "applicationType" ON app_sub.type_code :: text = "applicationType".code\n    LEFT JOIN alcs.local_government "localGovernment" ON app_sub.local_government_uuid = "localGovernment".uuid\n    AND "localGovernment".audit_deleted_date_at IS NULL\n    LEFT JOIN (\n      SELECT\n        max(status_link_1.effective_date) AS effective_date,\n        status_link_1.submission_uuid\n      FROM\n        alcs.application_submission_to_submission_status status_link_1\n      GROUP BY\n        status_link_1.submission_uuid\n    ) status_link ON status_link.submission_uuid = app_sub.uuid\n    LEFT JOIN (\n      SELECT\n        DISTINCT ON (decisions.applicationuuid) decisions.decisiondate AS date,\n        decisions.outcome,\n        decisions.dest_rank,\n        decisions.applicationuuid AS application_uuid\n      FROM\n        (\n          SELECT\n            decision.outcome_code AS outcome,\n            decision.date AS decisiondate,\n            decision.application_uuid AS applicationuuid,\n            rank() OVER (\n              PARTITION BY decision.application_uuid\n              ORDER BY\n                decision.date DESC,\n                decision.audit_created_at DESC\n            ) AS dest_rank\n          FROM\n            alcs.application_decision decision\n          WHERE\n            decision.is_draft = false\n            AND decision.audit_deleted_date_at IS NULL\n        ) decisions\n      WHERE\n        decisions.dest_rank = 1\n    ) decision_date ON decision_date.application_uuid = app.uuid\n  WHERE\n    app_sub.is_draft = false\n    AND app.date_received_all_items IS NOT NULL\n    AND app.date_received_all_items <= now()\n    AND (\n      alcs.get_current_status_for_application_submission_by_uuid(app_sub.uuid) ->> \'status_type_code\' :: text\n    ) <> \'CANC\' :: text\n    AND app_sub.audit_deleted_date_at IS NULL;',
      ],
    );
    await queryRunner.query(`CREATE VIEW "alcs"."public_application_submission_search_view" AS SELECT
    app_sub.uuid,
    app_sub.applicant,
    app.uuid AS application_uuid,
    "applicationType".audit_deleted_date_at AS "applicationType_audit_deleted_date_at",
    "applicationType".audit_created_at AS "applicationType_audit_created_at",
    "applicationType".audit_updated_at AS "applicationType_audit_updated_at",
    "applicationType".audit_created_by AS "applicationType_audit_created_by",
    "applicationType".audit_updated_by AS "applicationType_audit_updated_by",
    "applicationType".label AS "applicationType_label",
    "applicationType".code AS "applicationType_code",
    "applicationType".description AS "applicationType_description",
    "applicationType".short_label AS "applicationType_short_label",
    "applicationType".background_color AS "applicationType_background_color",
    "applicationType".text_color AS "applicationType_text_color",
    "applicationType".html_description AS "applicationType_html_description",
    "applicationType".portal_label AS "applicationType_portal_label",
    "applicationType".portal_order AS "applicationType_portal_order",
    "applicationType".requires_government_review AS "applicationType_requires_government_review",
    "applicationType".alc_fee_amount AS "applicationType_alc_fee_amount",
    "applicationType".government_fee_amount AS "applicationType_government_fee_amount",
    "localGovernment".name AS local_government_name,
    app_sub.file_number,
    app_sub.local_government_uuid,
    app_sub.type_code AS application_type_code,
    app.date_submitted_to_alc,
    app.decision_date,
    decision_date.outcome,
    decision_date.dest_rank,
    app.region_code AS application_region_code,
    GREATEST(status_link.effective_date, decision_date.date) AS last_update,
    alcs.get_current_status_for_application_submission_by_uuid(app_sub.uuid) AS status
  FROM
    alcs.application_submission app_sub
    JOIN alcs.application app ON app.file_number :: text = app_sub.file_number :: text
    AND app.hide_from_portal = false
    AND app.audit_deleted_date_at IS NULL
    JOIN alcs.application_type "applicationType" ON app_sub.type_code :: text = "applicationType".code
    LEFT JOIN alcs.local_government "localGovernment" ON app_sub.local_government_uuid = "localGovernment".uuid
    AND "localGovernment".audit_deleted_date_at IS NULL
    LEFT JOIN (
      SELECT
        max(status_link_1.effective_date) AS effective_date,
        status_link_1.submission_uuid
      FROM
        alcs.application_submission_to_submission_status status_link_1
      GROUP BY
        status_link_1.submission_uuid
    ) status_link ON status_link.submission_uuid = app_sub.uuid
    LEFT JOIN (
      SELECT
        DISTINCT ON (decisions.applicationuuid) decisions.decisiondate AS date,
        decisions.outcome,
        decisions.dest_rank,
        decisions.applicationuuid AS application_uuid
      FROM
        (
          SELECT
            decision.outcome_code AS outcome,
            decision.date AS decisiondate,
            decision.application_uuid AS applicationuuid,
            rank() OVER (
              PARTITION BY decision.application_uuid
              ORDER BY
                decision.date DESC,
                decision.audit_created_at DESC
            ) AS dest_rank
          FROM
            alcs.application_decision decision
          WHERE
            decision.is_draft = false
            AND decision.audit_deleted_date_at IS NULL
        ) decisions
      WHERE
        decisions.dest_rank = 1
    ) decision_date ON decision_date.application_uuid = app.uuid
  WHERE
    app_sub.is_draft = false
    AND app.date_received_all_items IS NOT NULL
    AND app.date_received_all_items <= now()
    AND (
      alcs.get_current_status_for_application_submission_by_uuid(app_sub.uuid) ->> 'status_type_code' :: text
    ) <> 'CANC' :: text
    AND app_sub.audit_deleted_date_at IS NULL;`);
  }
}
