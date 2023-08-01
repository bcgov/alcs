import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTableDescriptions1690845648906 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        COMMENT ON TABLE "alcs"."application" IS 'Base data for applications including the ID, key dates, and the date of the first decision';
        COMMENT ON TABLE "alcs"."application_decision" IS 'Decisions saved to applications, incl. those linked to the recon/modification request';
        COMMENT ON TABLE "alcs"."application_ceo_criterion_code" IS 'Code table for criteria under which the CEO can make a decision on an application';
        COMMENT ON TABLE "alcs"."application_decision_chair_review_outcome_type" IS 'Code table for the possible outcomes of the chair''s application decision review';
        COMMENT ON TABLE "alcs"."application_decision_component" IS 'Fields present on the application decision components';
        COMMENT ON TABLE "alcs"."application_decision_component_type" IS 'Code table for the possible application decision component types';
        COMMENT ON TABLE "alcs"."application_decision_condition" IS 'Fields present on the application decision conditions';
        COMMENT ON TABLE "alcs"."application_decision_condition_type" IS 'Code table for the possible application decision condition types';
        COMMENT ON TABLE "alcs"."application_decision_document" IS 'Links application decision document with the decision it''s saved to';
        COMMENT ON TABLE "alcs"."application_decision_maker_code" IS 'Code table for the possible application decision makers';
        COMMENT ON TABLE "alcs"."application_decision_meeting" IS 'Dates for application review discussions';
        COMMENT ON TABLE "alcs"."application_decision_outcome_code" IS 'Code table for the possible application decision outcomes';
        COMMENT ON TABLE "alcs"."application_document" IS 'Links application documents with the applications they''re saved to and logs other attributes';
        COMMENT ON TABLE "alcs"."application_document_code" IS 'Code table for possible document types';
        COMMENT ON TABLE "alcs"."application_local_government" IS 'Status, type, BCeID, and contact info of local or first nation governments';
        COMMENT ON TABLE "alcs"."application_meeting" IS 'Actions that un/pause applications';
        COMMENT ON TABLE "alcs"."application_meeting_type" IS 'Code table for possible action types that un/pause applications';
        COMMENT ON TABLE "alcs"."application_modification" IS 'Application modification requests linked to card and application';
        COMMENT ON TABLE "alcs"."application_modification_outcome_type" IS 'Code table for possible application modification review outcomes';
        COMMENT ON TABLE "alcs"."application_modified_decisions" IS 'Links application modification requests with their resulting decisions';
        COMMENT ON TABLE "alcs"."application_owner" IS 'Contact information, type, and corporate summary document UUID for owner or primary contact';
        COMMENT ON TABLE "alcs"."application_owner_type" IS 'Code table for possible types of owners or primary contacts';
        COMMENT ON TABLE "alcs"."application_parcel" IS 'Parcels associated with application submissions';
        COMMENT ON TABLE "alcs"."application_parcel_owners_application_owner" IS 'Links application parcels with their owners';
        COMMENT ON TABLE "alcs"."application_parcel_ownership_type" IS 'Code table for possible land ownership types (Fee simple vs Crown)';
        COMMENT ON TABLE "alcs"."application_paused" IS 'Date ranges responsible for un/pausing an application';
        COMMENT ON TABLE "alcs"."application_reconsideration" IS 'Application reconsideration requests linked to card and application';
        COMMENT ON TABLE "alcs"."application_reconsideration_outcome_type" IS 'Code table for possible application reconsideration review outcomes';
        COMMENT ON TABLE "alcs"."application_reconsideration_type" IS 'Code table for possible types of reconsiderations';
        COMMENT ON TABLE "alcs"."application_reconsidered_decisions" IS 'Links reconsideration requests with their resulting decisions';
        COMMENT ON TABLE "alcs"."application_region" IS 'Code table for possible administrative regions in the province';
        COMMENT ON TABLE "alcs"."application_submission_status_type" IS 'Code table for possible application portal statuses';
        COMMENT ON TABLE "alcs"."application_submission" IS 'Portal intake form fields for applications';
        COMMENT ON TABLE "alcs"."application_submission_review" IS 'Portal local or first nation government review form fields';
        COMMENT ON TABLE "alcs"."application_type" IS 'Code table for possible application types';
        COMMENT ON TABLE "alcs"."board" IS 'Kanban boards that exist in ALCS';
        COMMENT ON TABLE "alcs"."board_allowed_card_types_card_type" IS 'Card types allowed on each kanban board';
        COMMENT ON TABLE "alcs"."board_status" IS 'Columns on each kanban board';
        COMMENT ON TABLE "alcs"."card" IS 'Kanban board cards';
        COMMENT ON TABLE "alcs"."card_history" IS 'History of card status i.e. the column history of the card''s journey on boards';
      `,

      await queryRunner.query(
        `
        COMMENT ON TABLE "alcs"."card_status" IS 'Code table for possible kanban columns that cards can be in';
        COMMENT ON TABLE "alcs"."card_subtask" IS 'Attributes for card subtasks';
        COMMENT ON TABLE "alcs"."card_subtask_type" IS 'Code table for possible subtask types';
        COMMENT ON TABLE "alcs"."card_type" IS 'Code table for possible card types';
        COMMENT ON TABLE "alcs"."comment" IS 'Attributes for card comments';
        COMMENT ON TABLE "alcs"."comment_mention" IS 'Links comment mentions with the corresponding user';
        COMMENT ON TABLE "alcs"."covenant" IS 'Base data for covenants';
        COMMENT ON TABLE "alcs"."document" IS 'Attributes for documents including their ORCS classification';
        COMMENT ON TABLE "alcs"."email_status" IS 'Success or failure of emails sent by ALCS';
        COMMENT ON TABLE "alcs"."health_check" IS 'Unix timestamp of the last time the connection from API to database was checked and succeeded';
        COMMENT ON TABLE "alcs"."holiday_entity" IS 'Holidays used by the application active day tracking function';
        COMMENT ON TABLE "alcs"."linked_resolution_outcome_type" IS 'Code table for possible reconsideration decision outcome types';
        COMMENT ON TABLE "alcs"."migrations" IS 'Database migration history recorded by typeorm';
        COMMENT ON TABLE "alcs"."naru_subtype" IS 'Code table for possible subtypes of Non-Adhering Residential Use applications';
        COMMENT ON TABLE "alcs"."notice_of_intent" IS 'Base data for Notice of Intents incl. the ID, key dates, and the date of the first decision';
        COMMENT ON TABLE "alcs"."notice_of_intent_decision" IS 'Decisions saved to NOIs, linked to the modification request';
        COMMENT ON TABLE "alcs"."notice_of_intent_decision_document" IS 'Links NOI decision document with the decision it''s saved to';
        COMMENT ON TABLE "alcs"."notice_of_intent_decision_outcome" IS 'Code table for possible NOI decision outcomes';
        COMMENT ON TABLE "alcs"."notice_of_intent_meeting" IS 'Actions that un/pause NOIs';
        COMMENT ON TABLE "alcs"."notice_of_intent_meeting_type" IS 'Code table for possible action types that un/pause NOIs';
        COMMENT ON TABLE "alcs"."notice_of_intent_modification" IS 'NOI modification requests linked to card and application';
        COMMENT ON TABLE "alcs"."notice_of_intent_modification_outcome_type" IS 'Code table for possible NOI modification review outcomes';
        COMMENT ON TABLE "alcs"."notice_of_intent_modified_decisions" IS 'Links NOI modification requests with their resulting decisions';
        COMMENT ON TABLE "alcs"."notice_of_intent_subtype" IS 'Code table for possible NOI subtypes';
        COMMENT ON TABLE "alcs"."notice_of_intent_subtype_notice_of_intent_subtype" IS 'Links NOI subtypes to the NOI it''s saved to (many to one relationship)';
        COMMENT ON TABLE "alcs"."notification" IS 'In-app notification attributes';
        COMMENT ON TABLE "alcs"."parcel_lookup" IS 'Data from ParcelMapBC for use in the Portal';
        COMMENT ON TABLE "alcs"."planning_review" IS 'Base data for planning reviews';
        COMMENT ON TABLE "alcs"."staff_journal" IS 'Staff journal entries saved to applications and NOIs';
        COMMENT ON TABLE "alcs"."user" IS 'Authenticated users and their attributes';
        `,
      ),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //No
  }
}
