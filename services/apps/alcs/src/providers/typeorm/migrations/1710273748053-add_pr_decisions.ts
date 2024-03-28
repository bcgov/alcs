import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrDecisions1710273748053 implements MigrationInterface {
  name = 'AddPrDecisions1710273748053';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."planning_review_decision_document" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "decision_uuid" uuid NOT NULL, "document_uuid" uuid, CONSTRAINT "REL_82ba9c2d75bf10e7c6abae2e07" UNIQUE ("document_uuid"), CONSTRAINT "PK_b9304374dee3b46de5eca18dd67" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."planning_review_decision_outcome_code" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_f0ca5d421aa101c87c61e66c0e3" UNIQUE ("description"), CONSTRAINT "PK_ff611ee7c39894dd101e3d52914" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."planning_review_decision" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "date" TIMESTAMP WITH TIME ZONE, "was_released" boolean NOT NULL DEFAULT false, "outcome_code" text NOT NULL, "resolution_number" integer, "resolution_year" smallint NOT NULL, "is_draft" boolean NOT NULL DEFAULT false, "decision_description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "planning_review_uuid" uuid NOT NULL, CONSTRAINT "PK_fd29fa62e1b5b13602b851aa180" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."planning_review_decision"."is_draft" IS 'Indicates whether the decision is currently draft or not'; COMMENT ON COLUMN "alcs"."planning_review_decision"."decision_description" IS 'Staff input field for a description of the decision'; COMMENT ON COLUMN "alcs"."planning_review_decision"."created_at" IS 'Date that indicates when decision was created. It is not editable by user.'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c85b10d6e99cb1585f56f60ae8" ON "alcs"."planning_review_decision" ("resolution_number", "resolution_year") WHERE "audit_deleted_date_at" is null and "resolution_number" is not null`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD "decision_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision_document" ADD CONSTRAINT "FK_5866953e6d14233cace5d93564d" FOREIGN KEY ("decision_uuid") REFERENCES "alcs"."planning_review_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision_document" ADD CONSTRAINT "FK_82ba9c2d75bf10e7c6abae2e079" FOREIGN KEY ("document_uuid") REFERENCES "alcs"."document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision" ADD CONSTRAINT "FK_98f71d634dd9388cf287b02c728" FOREIGN KEY ("outcome_code") REFERENCES "alcs"."planning_review_decision_outcome_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision" ADD CONSTRAINT "FK_3d54a8ce0b6c8a61d413aeb0080" FOREIGN KEY ("planning_review_uuid") REFERENCES "alcs"."planning_review"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision" ALTER COLUMN "outcome_code" SET DEFAULT 'ENDO'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision" DROP CONSTRAINT "FK_3d54a8ce0b6c8a61d413aeb0080"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision" DROP CONSTRAINT "FK_98f71d634dd9388cf287b02c728"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision_document" DROP CONSTRAINT "FK_82ba9c2d75bf10e7c6abae2e079"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision_document" DROP CONSTRAINT "FK_5866953e6d14233cace5d93564d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP COLUMN "decision_date"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_c85b10d6e99cb1585f56f60ae8"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."planning_review_decision"`);
    await queryRunner.query(
      `DROP TABLE "alcs"."planning_review_decision_outcome_code"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."planning_review_decision_document"`,
    );
  }
}
