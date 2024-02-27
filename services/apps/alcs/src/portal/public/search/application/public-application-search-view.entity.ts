import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { LinkedStatusType } from '../public-search.dto';

@ViewEntity({
  expression: `
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
  `,
})
export class PublicApplicationSubmissionSearchView {
  @ViewColumn()
  @PrimaryColumn()
  uuid: string;

  @ViewColumn()
  applicationUuid: string;

  @ViewColumn()
  lastUpdate: Date;

  @ViewColumn()
  applicationRegionCode?: string;

  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  applicant?: string;

  @ViewColumn()
  localGovernmentUuid?: string;

  @ViewColumn()
  localGovernmentName?: string;

  @ViewColumn()
  applicationTypeCode: string;

  @ViewColumn()
  status: LinkedStatusType;

  @ViewColumn()
  dateSubmittedToAlc: Date | null;

  @ViewColumn()
  decisionDate: Date | null;

  @ViewColumn()
  destRank: number | null;

  @ViewColumn()
  outcome: string | null;
}
