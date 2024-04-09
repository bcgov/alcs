import { MigrationInterface, QueryRunner } from 'typeorm';

export class TableComments1712083862347 implements MigrationInterface {
  name = 'TableComments1712083862347';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."card_type" IS 'Code table for possible card types'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."card_status" IS 'Code table for possible kanban columns that cards can be in'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."board_status" IS 'Columns on each kanban board'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."board" IS 'Kanban boards that exist in ALCS'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."comment_mention" IS 'Links comment mentions with the corresponding user'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."comment" IS 'Attributes for card comments'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."card_history" IS 'History of card status i.e. the column history of the card''s journey on boards'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."card_subtask_type" IS 'Code table for possible subtask types'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."card_subtask" IS 'Attributes for card subtasks'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."card" IS 'Kanban board cards'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."document" IS 'Attributes for documents including their ORCS classification'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."user" IS 'Authenticated users and their attributes'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."health_check" IS 'Unix timestamp of the last time the connection from API to database was checked and succeeded'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."document_code" IS 'Code table for possible document types'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."email_status" IS 'Success or failure of emails sent by ALCS'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_submission_status_type" IS 'Statuses for Notification Submissions'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_submission_to_submission_status" IS 'Links Notifications to their Statuses with Dates'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_region" IS 'Code table for possible administrative regions in the province'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."local_government" IS 'Status, type, BCeID, and contact info of local or first nation governments'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_document" IS 'Documents for Notifications'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification" IS 'Stores Notification Class Applications such as SRWs'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."parcel_ownership_type" IS 'Code table for possible land ownership types (Fee simple vs Crown)'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_parcel" IS 'Parcels Related to Notification Applications'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."owner_type" IS 'Code table for possible types of owners or primary contacts'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_transferee" IS 'The Transferees related to Notification Applications'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_submission" IS 'Portal Submissions for Notifications'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."parcel_lookup" IS 'Data from ParcelMapBC for use in the Portal'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_submission_status_type" IS 'The code table for Notice of Intent Submissions Statuses'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_submission_to_submission_status" IS 'Join table to link Notice of Intent Submissions to their Statuses'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_subtype" IS 'Code table for possible NOI subtypes'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent" IS 'Base data for Notice of Intents incl. the ID, key dates, and the date of the first decision'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_parcel" IS 'Parcels that are linked to Notice of Intent Submissions'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_owner" IS 'Owners for Notice of Intent Submissions'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_ceo_criterion_code" IS 'Code table for criteria under which the CEO can make a decision on an application'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."naru_subtype" IS 'Code table for possible subtypes of Non-Adhering Residential Use applications'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_condition_to_component_lot" IS 'Join table to link approved subdivision lots between condition and components and provide plan numbers associated with survey plan per lot'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_component_lot" IS 'Approved lots on the subdivision decision component'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_component_type" IS 'Code table for the possible application decision component types'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_component" IS 'Fields present on the application decision components'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_condition_component_plan_number" IS 'Survey plan numbers associated with survey plan conditions on decision components'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_condition_type" IS 'Code table for the possible application decision condition types'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_condition" IS 'Fields present on the application decision conditions'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_document" IS 'Links application decision document with the decision it''s saved to'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_maker_code" IS 'Code table for the possible application decision makers'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_chair_review_outcome_type" IS 'Code table for the possible outcomes of the chair''s application decision review'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_outcome_code" IS 'Code table for the possible application decision outcomes'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_modification_outcome_type" IS 'Code table for possible application modification review outcomes'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_modification" IS 'Application modification requests linked to card and application'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision" IS 'Decisions saved to applications, incl. those linked to the recon/modification request'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_reconsideration_outcome_type" IS 'Code table for possible application reconsideration review outcomes'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_reconsideration_type" IS 'Code table for possible types of reconsiderations'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_reconsideration" IS 'Application reconsideration requests linked to card and application'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_type" IS 'Code table for possible application types'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_meeting" IS 'Dates for application review discussions'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_document" IS 'Links application documents with the applications they''re saved to and logs other attributes'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_meeting_type" IS 'Code table for possible action types that un/pause applications'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_paused" IS 'Date ranges responsible for un/pausing an application'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_meeting" IS 'Actions that un/pause applications'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application" IS 'Base data for applications including the ID, key dates, and the date of the first decision'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_submission_review" IS 'Portal local or first nation government review form fields'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_submission_status_type" IS 'Code table for possible application portal statuses'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_submission_to_submission_status" IS 'Join table that links submission with its status'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_parcel" IS 'Parcels associated with application submissions'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_owner" IS 'Contact information, type, and corporate summary document UUID for owner or primary contact'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_submission" IS 'Portal intake form fields for applications'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."configuration" IS 'Stores real time config values editable by ALCS Admin.'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."staff_journal" IS 'Staff journal entries saved to applications and NOIs, SRWs, Inquiries etc.'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_condition_type" IS 'Decision Condition Types Code Table for Notice of Intents'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_condition" IS 'Decision Conditions for Notice of Intents'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_component_type" IS 'Decision Component Types Code Table for Notice of Intents'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_component" IS 'Decision Components for Notice of Intents'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_document" IS 'Links NOI decision document with the decision it''s saved to'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_outcome" IS 'Code table for possible NOI decision outcomes'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_modification_outcome_type" IS 'Code table for possible NOI modification review outcomes'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_modification" IS 'NOI modification requests linked to card and application'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision" IS 'Decisions saved to NOIs, linked to the modification request'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."covenant_transferee" IS 'Stores Transferees for Restrictive Covenant Applications'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_meeting_type" IS 'Code table for possible action types that un/pause NOIs'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_meeting" IS 'Actions that un/pause NOIs'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_boundary_amendment" IS 'Used by ALC GIS Staff to track Inclusion / Exclusion decisions and their ALR boundary impact over time'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."holiday_entity" IS 'Holidays used by the application active day tracking function'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON TABLE "alcs"."holiday_entity" IS NULL`);
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_boundary_amendment" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_meeting" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_meeting_type" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."covenant_transferee" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_modification" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_modification_outcome_type" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_outcome" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_document" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_component" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_component_type" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_condition" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_condition_type" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON TABLE "alcs"."staff_journal" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."configuration" IS NULL`);
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_submission" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_owner" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_parcel" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_submission_to_submission_status" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_submission_status_type" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_submission_review" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON TABLE "alcs"."application" IS NULL`);
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_meeting" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_paused" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_meeting_type" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_document" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_meeting" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_type" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_reconsideration" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_reconsideration_type" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_reconsideration_outcome_type" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_modification" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_modification_outcome_type" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_outcome_code" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_chair_review_outcome_type" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_maker_code" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_document" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_condition" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_condition_type" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_condition_component_plan_number" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_component" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_component_type" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_component_lot" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_decision_condition_to_component_lot" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON TABLE "alcs"."naru_subtype" IS NULL`);
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_ceo_criterion_code" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_owner" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_parcel" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_subtype" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_submission_to_submission_status" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_submission_status_type" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON TABLE "alcs"."parcel_lookup" IS NULL`);
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_submission" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_transferee" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON TABLE "alcs"."owner_type" IS NULL`);
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_parcel" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."parcel_ownership_type" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON TABLE "alcs"."notification" IS NULL`);
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_document" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."local_government" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_region" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_submission_to_submission_status" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notification_submission_status_type" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON TABLE "alcs"."email_status" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."document_code" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."health_check" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."user" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."document" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."card" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."card_subtask" IS NULL`);
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."card_subtask_type" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON TABLE "alcs"."card_history" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."comment" IS NULL`);
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."comment_mention" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON TABLE "alcs"."board" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."board_status" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."card_status" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."card_type" IS NULL`);
  }
}
