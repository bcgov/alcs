import { MigrationInterface, QueryRunner } from 'typeorm';

export class noiDecisionsV21692812627565 implements MigrationInterface {
  name = 'noiDecisionsV21692812627565';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_decision_condition_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_d42e55b4aef0fdc3c676b32a2a3" UNIQUE ("description"), CONSTRAINT "PK_30a33ede5fb646124dd846719cd" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_condition_type" IS 'Decision Condition Types Code Table for Notice of Intents'`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_decision_condition" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "approval_dependant" boolean, "security_amount" numeric(12,2), "administrative_fee" numeric(12,2), "description" text, "completion_date" TIMESTAMP WITH TIME ZONE, "superseded_date" TIMESTAMP WITH TIME ZONE, "type_code" text, "decision_uuid" uuid NOT NULL, CONSTRAINT "PK_51e53b1c3920b8957bfe368c46a" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."notice_of_intent_decision_condition"."completion_date" IS 'Condition Completion date'; COMMENT ON COLUMN "alcs"."notice_of_intent_decision_condition"."superseded_date" IS 'Condition Superseded date'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_condition" IS 'Decision Conditions for Notice of Intents'`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_decision_component_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_6c4783f61a9a7fa784deac579ff" UNIQUE ("description"), CONSTRAINT "PK_67c2c14d96bec32f1d9c8e2e9b0" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_component_type" IS 'Decision Component Types Code Table for Notice of Intents'`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_decision_component" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "alr_area" numeric(12,2), "ag_cap" text, "ag_cap_source" text, "ag_cap_map" text, "ag_cap_consultant" text, "end_date" TIMESTAMP WITH TIME ZONE, "expiry_date" TIMESTAMP WITH TIME ZONE, "soil_fill_type_to_place" text, "soil_to_place_volume" numeric(12,2), "soil_to_place_area" numeric(12,2), "soil_to_place_maximum_depth" numeric(12,2), "soil_to_place_average_depth" numeric(12,2), "soil_type_removed" text, "soil_to_remove_volume" numeric(12,2), "soil_to_remove_area" numeric(12,2), "soil_to_remove_maximum_depth" numeric(12,2), "soil_to_remove_average_depth" numeric(12,2), "notice_of_intent_decision_component_type_code" text NOT NULL, "notice_of_intent_decision_uuid" uuid NOT NULL, CONSTRAINT "PK_cd1ed330456b906001d6b6288f6" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."notice_of_intent_decision_component"."alr_area" IS 'Area in hectares of ALR impacted by the decision component'; COMMENT ON COLUMN "alcs"."notice_of_intent_decision_component"."ag_cap" IS 'Agricultural cap classification'; COMMENT ON COLUMN "alcs"."notice_of_intent_decision_component"."ag_cap_source" IS 'Agricultural capability classification system used'; COMMENT ON COLUMN "alcs"."notice_of_intent_decision_component"."ag_cap_map" IS 'Agricultural capability map sheet reference'; COMMENT ON COLUMN "alcs"."notice_of_intent_decision_component"."ag_cap_consultant" IS 'Consultant who determined the agricultural capability'; COMMENT ON COLUMN "alcs"."notice_of_intent_decision_component"."end_date" IS 'Components\` end date'; COMMENT ON COLUMN "alcs"."notice_of_intent_decision_component"."expiry_date" IS 'Components\` expiry date'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_component" IS 'Decision Components for Notice of Intents'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4014f28095a987bb6bc515aa2b" ON "alcs"."notice_of_intent_decision_component" ("notice_of_intent_decision_component_type_code", "notice_of_intent_decision_uuid") WHERE "audit_deleted_date_at" is null`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_decision_condition_component" ("notice_of_intent_decision_condition_uuid" uuid NOT NULL, "notice_of_intent_decision_component_uuid" uuid NOT NULL, CONSTRAINT "PK_e91078d3e07b0f292333ff9d5d6" PRIMARY KEY ("notice_of_intent_decision_condition_uuid", "notice_of_intent_decision_component_uuid"))`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_condition_component" IS 'Tracks Conditions links Components'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4f1ecd62bb990e102c6af22a2e" ON "alcs"."notice_of_intent_decision_condition_component" ("notice_of_intent_decision_condition_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a8090f60d15374a96a0d15bb13" ON "alcs"."notice_of_intent_decision_condition_component" ("notice_of_intent_decision_component_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD "was_released" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD "is_draft" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."is_draft" IS 'Indicates whether the decision is currently draft or not'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD "is_subject_to_conditions" boolean`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."is_subject_to_conditions" IS 'Indicates whether the decision is subject to conditions'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD "decision_description" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."decision_description" IS 'Staff input field for a description of the decision'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD "is_stats_required" boolean`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."is_stats_required" IS 'Indicates whether the stats are required for the decision'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD "rescinded_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."rescinded_date" IS 'Date when decision was rescinded'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD "rescinded_comment" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."rescinded_comment" IS 'Comment provided by the staff when the decision was rescinded'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ALTER COLUMN "date" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition" ADD CONSTRAINT "FK_30a33ede5fb646124dd846719cd" FOREIGN KEY ("type_code") REFERENCES "alcs"."notice_of_intent_decision_condition_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition" ADD CONSTRAINT "FK_88a63053a271ef84bc673e2bf9b" FOREIGN KEY ("decision_uuid") REFERENCES "alcs"."notice_of_intent_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_component" ADD CONSTRAINT "FK_50ae784448f16c849fc9e9355c2" FOREIGN KEY ("notice_of_intent_decision_component_type_code") REFERENCES "alcs"."notice_of_intent_decision_component_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_component" ADD CONSTRAINT "FK_ac731e8132c6eb334dc44481c33" FOREIGN KEY ("notice_of_intent_decision_uuid") REFERENCES "alcs"."notice_of_intent_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_component" ADD CONSTRAINT "FK_4f1ecd62bb990e102c6af22a2e1" FOREIGN KEY ("notice_of_intent_decision_condition_uuid") REFERENCES "alcs"."notice_of_intent_decision_condition"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_component" ADD CONSTRAINT "FK_a8090f60d15374a96a0d15bb13f" FOREIGN KEY ("notice_of_intent_decision_component_uuid") REFERENCES "alcs"."notice_of_intent_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ALTER COLUMN "decision_maker" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ALTER COLUMN "decision_maker" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_component" DROP CONSTRAINT "FK_a8090f60d15374a96a0d15bb13f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_component" DROP CONSTRAINT "FK_4f1ecd62bb990e102c6af22a2e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_component" DROP CONSTRAINT "FK_ac731e8132c6eb334dc44481c33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_component" DROP CONSTRAINT "FK_50ae784448f16c849fc9e9355c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition" DROP CONSTRAINT "FK_88a63053a271ef84bc673e2bf9b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition" DROP CONSTRAINT "FK_30a33ede5fb646124dd846719cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ALTER COLUMN "date" SET NOT NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."rescinded_comment" IS 'Comment provided by the staff when the decision was rescinded'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "rescinded_comment"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."rescinded_date" IS 'Date when decision was rescinded'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "rescinded_date"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."is_stats_required" IS 'Indicates whether the stats are required for the decision'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "is_stats_required"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."decision_description" IS 'Staff input field for a description of the decision'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "decision_description"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."is_subject_to_conditions" IS 'Indicates whether the decision is subject to conditions'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "is_subject_to_conditions"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."is_draft" IS 'Indicates whether the decision is currently draft or not'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "is_draft"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "was_released"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_a8090f60d15374a96a0d15bb13"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_4f1ecd62bb990e102c6af22a2e"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_decision_condition_component"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_4014f28095a987bb6bc515aa2b"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_decision_component"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_decision_component_type"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_decision_condition"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_decision_condition_type"`,
    );
  }
}
