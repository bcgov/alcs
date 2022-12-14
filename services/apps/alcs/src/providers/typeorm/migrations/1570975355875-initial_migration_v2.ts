import { MigrationInterface, QueryRunner } from 'typeorm';

export class initialMigrationV21570975355875 implements MigrationInterface {
  name = 'initialMigrationV21570975355875';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."card_status" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_9743541eb8e42b744016f9d14f9" UNIQUE ("description"), CONSTRAINT "PK_3e1a5a0591f4b54698ea641c38d" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."comment_mention" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "comment_uuid" uuid NOT NULL, "user_uuid" uuid NOT NULL, "mention_label" character varying NOT NULL, CONSTRAINT "PK_feed00139ed51070bcebe19773f" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."document" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "file_key" character varying NOT NULL, "file_name" character varying NOT NULL, "mime_type" character varying NOT NULL, "uploaded_by_uuid" uuid NOT NULL, "tags" text array NOT NULL DEFAULT '{}', "uploaded_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8960855240f8a386eed1d7791c1" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."user" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "email" character varying NOT NULL, "display_name" character varying NOT NULL, "identity_provider" character varying NOT NULL, "preferred_username" character varying NOT NULL, "name" character varying, "given_name" character varying, "family_name" character varying, "idir_user_guid" character varying, "idir_user_name" character varying, "bceid_guid" character varying, "bceid_user_name" character varying, "client_roles" text array NOT NULL DEFAULT '{}', "settings" jsonb, CONSTRAINT "PK_a95e949168be7b7ece1a2382fed" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_9b4bff420dc831713caf962716" ON "alcs"."user" ("idir_user_guid") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_298a928993eee3de03067af610" ON "alcs"."user" ("bceid_guid") `,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."comment" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "body" character varying NOT NULL, "edited" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "card_uuid" uuid NOT NULL, "author_uuid" uuid, CONSTRAINT "PK_e45a9d11ff7a3cf11f6c42107b4" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_acb37fb28b6e19312217e12aaa" ON "alcs"."comment" ("card_uuid") `,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."card_history" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" character varying NOT NULL, "status_code" character varying NOT NULL, "card_uuid" uuid, CONSTRAINT "PK_72bac9dd2ac14e72ea407e000f3" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."card_subtask_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, "background_color" character varying NOT NULL, "text_color" character varying NOT NULL, CONSTRAINT "UQ_b0fe71e81495b000b2fd3637ef5" UNIQUE ("description"), CONSTRAINT "PK_ea97b0efe5b7c84d8146e8c9184" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."card_subtask" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "completed_at" TIMESTAMP WITH TIME ZONE, "assignee_uuid" uuid, "card_uuid" uuid NOT NULL, "type_code" text, CONSTRAINT "PK_1196033d1dfc3f1f0d102eb9a6a" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."card_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_715d4a7d408c461949a6f007a71" UNIQUE ("description"), CONSTRAINT "PK_30b9e07ab7c729f90911604179f" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."card" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "high_priority" boolean NOT NULL DEFAULT false, "status_code" text NOT NULL DEFAULT 'SUBM', "board_uuid" uuid NOT NULL DEFAULT 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', "assignee_uuid" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type_code" text NOT NULL DEFAULT 'APP', CONSTRAINT "PK_dc3046f87b3ecabadae16bc4a8b" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."board" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "code" character varying NOT NULL, "title" character varying NOT NULL, "decision_maker" character varying NOT NULL, CONSTRAINT "UQ_677fd48b030e8ba19b2c0f1f8b6" UNIQUE ("code"), CONSTRAINT "PK_cd77b28e379de081c2b733b3f08" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."board_status" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "order" integer NOT NULL, "board_uuid" uuid NOT NULL, "status_code" text NOT NULL, CONSTRAINT "UQ_cf22f0a664bdb4efafd1bce647d" UNIQUE ("board_uuid", "status_code"), CONSTRAINT "PK_011eeedcd1eb7802ad33e26a32c" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_decision_meeting" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "date" TIMESTAMP WITH TIME ZONE NOT NULL, "application_uuid" uuid NOT NULL, CONSTRAINT "PK_f8239cd4da09e40ee76649bf85a" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_modification_outcome_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_1bf0bc8252617734f5d0dd28c5a" UNIQUE ("description"), CONSTRAINT "PK_6e4262b822917018a1be73236c5" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_modification" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "submitted_date" TIMESTAMP WITH TIME ZONE NOT NULL, "review_outcome_code" text NOT NULL DEFAULT 'PEN', "is_time_extension" boolean NOT NULL, "review_date" TIMESTAMP WITH TIME ZONE, "application_uuid" uuid NOT NULL, "card_uuid" uuid NOT NULL, CONSTRAINT "REL_cd2e34439334004189a8767b96" UNIQUE ("card_uuid"), CONSTRAINT "PK_e2b203cbebea1c259eab06fad37" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."decision_outcome_code" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, "is_first_decision" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_3d4fc01e839951bb6d57330bfc5" UNIQUE ("description"), CONSTRAINT "PK_6601a2660a07574e6a960efbc07" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."ceo_criterion_code" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, "number" integer NOT NULL, CONSTRAINT "UQ_f82ca3d9fac15eebfb7602d3f16" UNIQUE ("description"), CONSTRAINT "UQ_e7748be0c249a306c2004fb1b36" UNIQUE ("number"), CONSTRAINT "PK_c40d1e72094d8e1e7744f723527" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."decision_document" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "decision_uuid" uuid NOT NULL, "document_uuid" uuid, CONSTRAINT "REL_83717f1d73931fd18e810c03aa" UNIQUE ("document_uuid"), CONSTRAINT "PK_251180d41aea07259eb6686a4e7" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."decision_maker_code" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_47672fa34ef451500e37b6c95b9" UNIQUE ("description"), CONSTRAINT "PK_8d4f3ded27681fee4991c50bd5a" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_decision_chair_review_outcome_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_e5eef93f2745a8142a23eab697c" UNIQUE ("description"), CONSTRAINT "PK_a6c8477e05aafb8345002bb397f" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_decision" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "date" TIMESTAMP WITH TIME ZONE NOT NULL, "audit_date" TIMESTAMP WITH TIME ZONE, "chair_review_required" boolean NOT NULL, "chair_review_date" TIMESTAMP WITH TIME ZONE, "outcome_code" text NOT NULL, "resolution_number" integer NOT NULL, "resolution_year" smallint NOT NULL, "decision_maker_code" text, "ceo_criterion_code" text, "is_time_extension" boolean, "is_other" boolean, "chair_review_outcome_code" text, "application_uuid" uuid NOT NULL, "modifies_uuid" uuid, "reconsiders_uuid" uuid, CONSTRAINT "resolution" UNIQUE ("resolution_number", "resolution_year"), CONSTRAINT "REL_336dee89b6eed32db8e13ea0fe" UNIQUE ("modifies_uuid"), CONSTRAINT "REL_36c741e57451dc780e6968fe48" UNIQUE ("reconsiders_uuid"), CONSTRAINT "PK_f1cbebd03275dcbe1a70d46cebf" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_reconsideration_outcome_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_eaad3466afc023a3e9da9360e1a" UNIQUE ("description"), CONSTRAINT "PK_5c6b9f7e0b9e856b4974b538846" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_reconsideration_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_5b1fb0d7da5d5f623c44bca7e02" UNIQUE ("description"), CONSTRAINT "PK_8cc8462c63cbb9608a920e9edde" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_reconsideration" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "submitted_date" TIMESTAMP WITH TIME ZONE NOT NULL, "review_outcome_code" text, "review_date" TIMESTAMP WITH TIME ZONE, "application_uuid" uuid NOT NULL, "card_uuid" uuid NOT NULL, "type_code" text NOT NULL, CONSTRAINT "REL_6d10e08b482effb968defe5535" UNIQUE ("card_uuid"), CONSTRAINT "PK_9aadf4188d47bd2ccf9b24e6ccb" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_region" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_cd2aeaf77db9f2e0b50d194aa78" UNIQUE ("description"), CONSTRAINT "PK_805ded031f6340b59f60b6f76f5" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, "short_label" character varying NOT NULL, "background_color" character varying NOT NULL, "text_color" character varying NOT NULL, "html_description" text NOT NULL DEFAULT '', "portal_label" text NOT NULL DEFAULT '', CONSTRAINT "UQ_a5eabdc27d5f23d654bb51bae24" UNIQUE ("description"), CONSTRAINT "PK_c11f09867d33ab9bea127b7fa87" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_local_government" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "preferred_region_code" text NOT NULL, CONSTRAINT "PK_58853fcb8957e8b2c131cc12da1" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_document" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "type" character varying NOT NULL, "application_uuid" uuid NOT NULL, "document_uuid" uuid, CONSTRAINT "REL_12ae8ee45c8e1f1b074c169a3e" UNIQUE ("document_uuid"), CONSTRAINT "PK_87ec4d3edd458858cf7370ddfd3" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_meeting_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_d1e025597c97f817a546a3877c9" UNIQUE ("description"), CONSTRAINT "PK_85b30b748ea5fd08763e0ecf628" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_paused" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "start_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "end_date" TIMESTAMP WITH TIME ZONE, "application_uuid" uuid NOT NULL, CONSTRAINT "PK_95172cd91291d9e80bbebe2c1d6" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_meeting" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "description" text, "type_code" text NOT NULL, "application_uuid" uuid NOT NULL, "meeting_pause_uuid" uuid, "report_pause_uuid" uuid, CONSTRAINT "REL_c6031d3312bd42fd3f325eba26" UNIQUE ("meeting_pause_uuid"), CONSTRAINT "REL_77fa445c8781553d4ebd7a1574" UNIQUE ("report_pause_uuid"), CONSTRAINT "PK_cd00f1709cc87faf611c3e4c284" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "file_number" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "applicant" character varying NOT NULL, "summary" text, "date_submitted_to_alc" TIMESTAMP WITH TIME ZONE, "date_paid" TIMESTAMP WITH TIME ZONE, "date_acknowledged_incomplete" TIMESTAMP WITH TIME ZONE, "date_received_all_items" TIMESTAMP WITH TIME ZONE, "date_acknowledged_complete" TIMESTAMP WITH TIME ZONE, "decision_date" TIMESTAMP WITH TIME ZONE, "notification_sent_date" TIMESTAMP WITH TIME ZONE, "type_code" text NOT NULL, "region_code" text NOT NULL, "local_government_uuid" uuid NOT NULL, "card_uuid" uuid NOT NULL, CONSTRAINT "UQ_39c4f5ceb0f5a7a4c819d46a0d5" UNIQUE ("file_number"), CONSTRAINT "REL_21eddf92cb75ff3cc0c99b80d8" UNIQUE ("card_uuid"), CONSTRAINT "PK_71af2cd4dccba665296d4befbfe" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."covenant" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "file_number" character varying NOT NULL, "applicant" character varying NOT NULL, "card_uuid" uuid NOT NULL, "local_government_uuid" uuid NOT NULL, "region_code" text NOT NULL, CONSTRAINT "UQ_a5dfb1e8f2d584102ea62cc2eed" UNIQUE ("file_number"), CONSTRAINT "REL_4dbfa43fa598901ae71504afab" UNIQUE ("card_uuid"), CONSTRAINT "PK_cefaa63a1ab0918cbda7dc123aa" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."health_check" ("id" SERIAL NOT NULL, "update_date" bigint NOT NULL DEFAULT '1657753460650', CONSTRAINT "PK_bb6ae6b7bca4235bf4563eaeaad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notification" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "receiver_uuid" uuid NOT NULL, "title" character varying NOT NULL, "body" character varying NOT NULL, "read" boolean NOT NULL DEFAULT false, "target_type" character varying NOT NULL, "link" character varying NOT NULL, "actor_uuid" uuid, CONSTRAINT "PK_b9fa421f94f7707ba109bf73b82" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."planning_review" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "file_number" character varying NOT NULL, "type" character varying NOT NULL, "card_uuid" uuid NOT NULL, "local_government_uuid" uuid NOT NULL, "region_code" text NOT NULL, CONSTRAINT "UQ_a62913da5fae4a128c8e8f264fc" UNIQUE ("file_number"), CONSTRAINT "REL_735dcdd4fa909a60d0fa1828f2" UNIQUE ("card_uuid"), CONSTRAINT "PK_ca2ff05fa38d67415362b6a3912" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."modified_decisions" ("application_modification_uuid" uuid NOT NULL, "application_decision_uuid" uuid NOT NULL, CONSTRAINT "PK_1f795ed15028327e1dbd148e0ae" PRIMARY KEY ("application_modification_uuid", "application_decision_uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_733d6d17b98e6b6d3cd8335910" ON "alcs"."modified_decisions" ("application_modification_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0e1b988c373de06ec277bca369" ON "alcs"."modified_decisions" ("application_decision_uuid") `,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."reconsidered_decisions" ("application_reconsideration_uuid" uuid NOT NULL, "application_decision_uuid" uuid NOT NULL, CONSTRAINT "PK_cb96dbef3e7dd5c3db49c62d517" PRIMARY KEY ("application_reconsideration_uuid", "application_decision_uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d7e09c1b2ce86005b7d0465215" ON "alcs"."reconsidered_decisions" ("application_reconsideration_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_09a58410db3f33249018127977" ON "alcs"."reconsidered_decisions" ("application_decision_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."comment_mention" ADD CONSTRAINT "FK_e93e63158f6402819a1bcf77216" FOREIGN KEY ("comment_uuid") REFERENCES "alcs"."comment"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."comment_mention" ADD CONSTRAINT "FK_15ec79570aca5e00f9c102ae1a0" FOREIGN KEY ("user_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ADD CONSTRAINT "FK_9b9254f412e8a5a07063209a08c" FOREIGN KEY ("uploaded_by_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."comment" ADD CONSTRAINT "FK_f2d86184a78b855225c1395dfd3" FOREIGN KEY ("author_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."comment" ADD CONSTRAINT "FK_acb37fb28b6e19312217e12aaa2" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card_history" ADD CONSTRAINT "FK_b9537303955ebb0430c46d95997" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card_subtask" ADD CONSTRAINT "FK_35829d0ec7a6e71391c2349188f" FOREIGN KEY ("assignee_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card_subtask" ADD CONSTRAINT "FK_27ad2b929d07d4c4e43943f8e62" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card_subtask" ADD CONSTRAINT "FK_ea97b0efe5b7c84d8146e8c9184" FOREIGN KEY ("type_code") REFERENCES "alcs"."card_subtask_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card" ADD CONSTRAINT "FK_3e1a5a0591f4b54698ea641c38d" FOREIGN KEY ("status_code") REFERENCES "alcs"."card_status"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card" ADD CONSTRAINT "FK_38a14bc9166d9fac12861d07cdd" FOREIGN KEY ("board_uuid") REFERENCES "alcs"."board"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card" ADD CONSTRAINT "FK_e91ded29d40ce244c61402e65fe" FOREIGN KEY ("assignee_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card" ADD CONSTRAINT "FK_30b9e07ab7c729f90911604179f" FOREIGN KEY ("type_code") REFERENCES "alcs"."card_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."board_status" ADD CONSTRAINT "FK_30cd0aba1ecf48c3687eaa215e1" FOREIGN KEY ("board_uuid") REFERENCES "alcs"."board"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."board_status" ADD CONSTRAINT "FK_f7dd22f525a7b3712256f63ebcb" FOREIGN KEY ("status_code") REFERENCES "alcs"."card_status"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_meeting" ADD CONSTRAINT "FK_8629d5787d89267d417dcbb369b" FOREIGN KEY ("application_uuid") REFERENCES "alcs"."application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" ADD CONSTRAINT "FK_1b9a2161c74b1777bb00e7500f8" FOREIGN KEY ("review_outcome_code") REFERENCES "alcs"."application_modification_outcome_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" ADD CONSTRAINT "FK_3839ac16a55bdfe8fda77dbd050" FOREIGN KEY ("application_uuid") REFERENCES "alcs"."application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" ADD CONSTRAINT "FK_cd2e34439334004189a8767b960" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" ADD CONSTRAINT "FK_a86632c9a6ab56e984cf1cc9e6b" FOREIGN KEY ("decision_uuid") REFERENCES "alcs"."application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" ADD CONSTRAINT "FK_83717f1d73931fd18e810c03aa7" FOREIGN KEY ("document_uuid") REFERENCES "alcs"."document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_d00682751a3d4cdd7c9a16ab041" FOREIGN KEY ("outcome_code") REFERENCES "alcs"."decision_outcome_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_0c9a7750537b07493a78248b295" FOREIGN KEY ("application_uuid") REFERENCES "alcs"."application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_9bfe649b67952a226317fc3c1ae" FOREIGN KEY ("decision_maker_code") REFERENCES "alcs"."decision_maker_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_421d167684e2e83d826f939bea7" FOREIGN KEY ("ceo_criterion_code") REFERENCES "alcs"."ceo_criterion_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_dc34f50291af0299bd44e8d0448" FOREIGN KEY ("chair_review_outcome_code") REFERENCES "alcs"."application_decision_chair_review_outcome_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_336dee89b6eed32db8e13ea0fe9" FOREIGN KEY ("modifies_uuid") REFERENCES "alcs"."application_modification"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_36c741e57451dc780e6968fe485" FOREIGN KEY ("reconsiders_uuid") REFERENCES "alcs"."application_reconsideration"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ADD CONSTRAINT "FK_8cc8462c63cbb9608a920e9edde" FOREIGN KEY ("type_code") REFERENCES "alcs"."application_reconsideration_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ADD CONSTRAINT "FK_bcb7f86e9e22f3632cf52135540" FOREIGN KEY ("review_outcome_code") REFERENCES "alcs"."application_reconsideration_outcome_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ADD CONSTRAINT "FK_69f4ed0db8aa26fca099a85d3bd" FOREIGN KEY ("application_uuid") REFERENCES "alcs"."application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ADD CONSTRAINT "FK_6d10e08b482effb968defe55357" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_local_government" ADD CONSTRAINT "FK_b7e4525de796ada01f43f464d9d" FOREIGN KEY ("preferred_region_code") REFERENCES "alcs"."application_region"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ADD CONSTRAINT "FK_6c496454f95f229c63679bf191e" FOREIGN KEY ("application_uuid") REFERENCES "alcs"."application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ADD CONSTRAINT "FK_12ae8ee45c8e1f1b074c169a3e5" FOREIGN KEY ("document_uuid") REFERENCES "alcs"."document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_paused" ADD CONSTRAINT "FK_57e39f7c811d07c646fc04e8bdf" FOREIGN KEY ("application_uuid") REFERENCES "alcs"."application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_meeting" ADD CONSTRAINT "FK_85b30b748ea5fd08763e0ecf628" FOREIGN KEY ("type_code") REFERENCES "alcs"."application_meeting_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_meeting" ADD CONSTRAINT "FK_4a7e09569765e147304194b63f5" FOREIGN KEY ("application_uuid") REFERENCES "alcs"."application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_meeting" ADD CONSTRAINT "FK_c6031d3312bd42fd3f325eba266" FOREIGN KEY ("meeting_pause_uuid") REFERENCES "alcs"."application_paused"("uuid") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_meeting" ADD CONSTRAINT "FK_77fa445c8781553d4ebd7a15749" FOREIGN KEY ("report_pause_uuid") REFERENCES "alcs"."application_paused"("uuid") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD CONSTRAINT "FK_c11f09867d33ab9bea127b7fa87" FOREIGN KEY ("type_code") REFERENCES "alcs"."application_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD CONSTRAINT "FK_805ded031f6340b59f60b6f76f5" FOREIGN KEY ("region_code") REFERENCES "alcs"."application_region"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD CONSTRAINT "FK_58853fcb8957e8b2c131cc12da1" FOREIGN KEY ("local_government_uuid") REFERENCES "alcs"."application_local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD CONSTRAINT "FK_21eddf92cb75ff3cc0c99b80d86" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."covenant" ADD CONSTRAINT "FK_4dbfa43fa598901ae71504afabf" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."covenant" ADD CONSTRAINT "FK_0fa742d800bc0e0b3f2451e0f0b" FOREIGN KEY ("local_government_uuid") REFERENCES "alcs"."application_local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."covenant" ADD CONSTRAINT "FK_a62eb808822aabedb56e1c9d928" FOREIGN KEY ("region_code") REFERENCES "alcs"."application_region"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification" ADD CONSTRAINT "FK_fc0e9a26b0a8f7c76658ca1c6ca" FOREIGN KEY ("actor_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification" ADD CONSTRAINT "FK_b776eec36c2a6b6879c14241e91" FOREIGN KEY ("receiver_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD CONSTRAINT "FK_735dcdd4fa909a60d0fa1828f24" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD CONSTRAINT "FK_5a57c8d407eb6132ed39cb8fe6f" FOREIGN KEY ("local_government_uuid") REFERENCES "alcs"."application_local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD CONSTRAINT "FK_409473aef1f92b6675e3f7c00ad" FOREIGN KEY ("region_code") REFERENCES "alcs"."application_region"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."modified_decisions" ADD CONSTRAINT "FK_733d6d17b98e6b6d3cd83359101" FOREIGN KEY ("application_modification_uuid") REFERENCES "alcs"."application_modification"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."modified_decisions" ADD CONSTRAINT "FK_0e1b988c373de06ec277bca3692" FOREIGN KEY ("application_decision_uuid") REFERENCES "alcs"."application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."reconsidered_decisions" ADD CONSTRAINT "FK_d7e09c1b2ce86005b7d0465215f" FOREIGN KEY ("application_reconsideration_uuid") REFERENCES "alcs"."application_reconsideration"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."reconsidered_decisions" ADD CONSTRAINT "FK_09a58410db3f332490181279771" FOREIGN KEY ("application_decision_uuid") REFERENCES "alcs"."application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."reconsidered_decisions" DROP CONSTRAINT "FK_09a58410db3f332490181279771"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."reconsidered_decisions" DROP CONSTRAINT "FK_d7e09c1b2ce86005b7d0465215f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."modified_decisions" DROP CONSTRAINT "FK_0e1b988c373de06ec277bca3692"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."modified_decisions" DROP CONSTRAINT "FK_733d6d17b98e6b6d3cd83359101"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP CONSTRAINT "FK_409473aef1f92b6675e3f7c00ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP CONSTRAINT "FK_5a57c8d407eb6132ed39cb8fe6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP CONSTRAINT "FK_735dcdd4fa909a60d0fa1828f24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification" DROP CONSTRAINT "FK_b776eec36c2a6b6879c14241e91"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification" DROP CONSTRAINT "FK_fc0e9a26b0a8f7c76658ca1c6ca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."covenant" DROP CONSTRAINT "FK_a62eb808822aabedb56e1c9d928"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."covenant" DROP CONSTRAINT "FK_0fa742d800bc0e0b3f2451e0f0b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."covenant" DROP CONSTRAINT "FK_4dbfa43fa598901ae71504afabf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP CONSTRAINT "FK_21eddf92cb75ff3cc0c99b80d86"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP CONSTRAINT "FK_58853fcb8957e8b2c131cc12da1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP CONSTRAINT "FK_805ded031f6340b59f60b6f76f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP CONSTRAINT "FK_c11f09867d33ab9bea127b7fa87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_meeting" DROP CONSTRAINT "FK_77fa445c8781553d4ebd7a15749"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_meeting" DROP CONSTRAINT "FK_c6031d3312bd42fd3f325eba266"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_meeting" DROP CONSTRAINT "FK_4a7e09569765e147304194b63f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_meeting" DROP CONSTRAINT "FK_85b30b748ea5fd08763e0ecf628"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_paused" DROP CONSTRAINT "FK_57e39f7c811d07c646fc04e8bdf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" DROP CONSTRAINT "FK_12ae8ee45c8e1f1b074c169a3e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" DROP CONSTRAINT "FK_6c496454f95f229c63679bf191e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_local_government" DROP CONSTRAINT "FK_b7e4525de796ada01f43f464d9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" DROP CONSTRAINT "FK_6d10e08b482effb968defe55357"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" DROP CONSTRAINT "FK_69f4ed0db8aa26fca099a85d3bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" DROP CONSTRAINT "FK_bcb7f86e9e22f3632cf52135540"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" DROP CONSTRAINT "FK_8cc8462c63cbb9608a920e9edde"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_36c741e57451dc780e6968fe485"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_336dee89b6eed32db8e13ea0fe9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_dc34f50291af0299bd44e8d0448"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_421d167684e2e83d826f939bea7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_9bfe649b67952a226317fc3c1ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_0c9a7750537b07493a78248b295"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_d00682751a3d4cdd7c9a16ab041"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" DROP CONSTRAINT "FK_83717f1d73931fd18e810c03aa7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" DROP CONSTRAINT "FK_a86632c9a6ab56e984cf1cc9e6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" DROP CONSTRAINT "FK_cd2e34439334004189a8767b960"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" DROP CONSTRAINT "FK_3839ac16a55bdfe8fda77dbd050"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" DROP CONSTRAINT "FK_1b9a2161c74b1777bb00e7500f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_meeting" DROP CONSTRAINT "FK_8629d5787d89267d417dcbb369b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."board_status" DROP CONSTRAINT "FK_f7dd22f525a7b3712256f63ebcb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."board_status" DROP CONSTRAINT "FK_30cd0aba1ecf48c3687eaa215e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card" DROP CONSTRAINT "FK_30b9e07ab7c729f90911604179f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card" DROP CONSTRAINT "FK_e91ded29d40ce244c61402e65fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card" DROP CONSTRAINT "FK_38a14bc9166d9fac12861d07cdd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card" DROP CONSTRAINT "FK_3e1a5a0591f4b54698ea641c38d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card_subtask" DROP CONSTRAINT "FK_ea97b0efe5b7c84d8146e8c9184"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card_subtask" DROP CONSTRAINT "FK_27ad2b929d07d4c4e43943f8e62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card_subtask" DROP CONSTRAINT "FK_35829d0ec7a6e71391c2349188f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."card_history" DROP CONSTRAINT "FK_b9537303955ebb0430c46d95997"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."comment" DROP CONSTRAINT "FK_acb37fb28b6e19312217e12aaa2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."comment" DROP CONSTRAINT "FK_f2d86184a78b855225c1395dfd3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" DROP CONSTRAINT "FK_9b9254f412e8a5a07063209a08c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."comment_mention" DROP CONSTRAINT "FK_15ec79570aca5e00f9c102ae1a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."comment_mention" DROP CONSTRAINT "FK_e93e63158f6402819a1bcf77216"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_09a58410db3f33249018127977"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_d7e09c1b2ce86005b7d0465215"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."reconsidered_decisions"`);
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_0e1b988c373de06ec277bca369"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_733d6d17b98e6b6d3cd8335910"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."modified_decisions"`);
    await queryRunner.query(`DROP TABLE "alcs"."planning_review"`);
    await queryRunner.query(`DROP TABLE "alcs"."notification"`);
    await queryRunner.query(`DROP TABLE "alcs"."health_check"`);
    await queryRunner.query(`DROP TABLE "alcs"."covenant"`);
    await queryRunner.query(`DROP TABLE "alcs"."application"`);
    await queryRunner.query(`DROP TABLE "alcs"."application_meeting"`);
    await queryRunner.query(`DROP TABLE "alcs"."application_paused"`);
    await queryRunner.query(`DROP TABLE "alcs"."application_meeting_type"`);
    await queryRunner.query(`DROP TABLE "alcs"."application_document"`);
    await queryRunner.query(`DROP TABLE "alcs"."application_local_government"`);
    await queryRunner.query(`DROP TABLE "alcs"."application_type"`);
    await queryRunner.query(`DROP TABLE "alcs"."application_region"`);
    await queryRunner.query(`DROP TABLE "alcs"."application_reconsideration"`);
    await queryRunner.query(
      `DROP TABLE "alcs"."application_reconsideration_type"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_reconsideration_outcome_type"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."application_decision"`);
    await queryRunner.query(
      `DROP TABLE "alcs"."application_decision_chair_review_outcome_type"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."decision_maker_code"`);
    await queryRunner.query(`DROP TABLE "alcs"."decision_document"`);
    await queryRunner.query(`DROP TABLE "alcs"."ceo_criterion_code"`);
    await queryRunner.query(`DROP TABLE "alcs"."decision_outcome_code"`);
    await queryRunner.query(`DROP TABLE "alcs"."application_modification"`);
    await queryRunner.query(
      `DROP TABLE "alcs"."application_modification_outcome_type"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."application_decision_meeting"`);
    await queryRunner.query(`DROP TABLE "alcs"."board_status"`);
    await queryRunner.query(`DROP TABLE "alcs"."board"`);
    await queryRunner.query(`DROP TABLE "alcs"."card"`);
    await queryRunner.query(`DROP TABLE "alcs"."card_type"`);
    await queryRunner.query(`DROP TABLE "alcs"."card_subtask"`);
    await queryRunner.query(`DROP TABLE "alcs"."card_subtask_type"`);
    await queryRunner.query(`DROP TABLE "alcs"."card_history"`);
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_acb37fb28b6e19312217e12aaa"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."comment"`);
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_298a928993eee3de03067af610"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_9b4bff420dc831713caf962716"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."user"`);
    await queryRunner.query(`DROP TABLE "alcs"."document"`);
    await queryRunner.query(`DROP TABLE "alcs"."comment_mention"`);
    await queryRunner.query(`DROP TABLE "alcs"."card_status"`);
  }
}
