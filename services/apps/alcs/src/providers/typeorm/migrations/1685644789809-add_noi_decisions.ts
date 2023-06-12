import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoiDecisions1685644789809 implements MigrationInterface {
  name = 'addNoiDecisions1685644789809';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_document" DROP CONSTRAINT "FK_83717f1d73931fd18e810c03aa7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_document" DROP CONSTRAINT "FK_a86632c9a6ab56e984cf1cc9e6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsidered_decisions" DROP CONSTRAINT "FK_d7e09c1b2ce86005b7d0465215f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsidered_decisions" DROP CONSTRAINT "FK_09a58410db3f332490181279771"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modified_decisions" DROP CONSTRAINT "FK_733d6d17b98e6b6d3cd83359101"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modified_decisions" DROP CONSTRAINT "FK_0e1b988c373de06ec277bca3692"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_9fd353dcf19ea98d0de8ff8be9"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_d7e09c1b2ce86005b7d0465215"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_09a58410db3f33249018127977"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_733d6d17b98e6b6d3cd8335910"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_0e1b988c373de06ec277bca369"`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_decision_outcome" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, "is_first_decision" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_45b926683a41c959974d3db1f59" UNIQUE ("description"), CONSTRAINT "PK_d4a78fa6d709aace10890017271" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_decision_document" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "decision_uuid" uuid NOT NULL, "document_uuid" uuid, CONSTRAINT "REL_5cd9c5f049e6350d1335a31e6b" UNIQUE ("document_uuid"), CONSTRAINT "PK_c191b303390765bb9763a414cba" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_decision" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "date" TIMESTAMP WITH TIME ZONE NOT NULL, "audit_date" TIMESTAMP WITH TIME ZONE, "outcome_code" text NOT NULL, "resolution_number" integer, "resolution_year" smallint NOT NULL, "decision_maker" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "notice_of_intent_uuid" uuid NOT NULL, CONSTRAINT "PK_5a17436f57102ce6703fed9a247" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."notice_of_intent_decision"."created_at" IS 'Date that indicates when decision was created. It is not editable by user.'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_6c08935ebe83afbea6a08c403c" ON "alcs"."notice_of_intent_decision" ("resolution_number", "resolution_year") WHERE "audit_deleted_date_at" is null and "resolution_number" is not null`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "decision_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_158b067f2525c02879ff25b3d0" ON "alcs"."application_decision" ("resolution_number", "resolution_year") WHERE "audit_deleted_date_at" is null and "resolution_number" is not null`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfb3d89d5587e33928949cc97d" ON "alcs"."application_reconsidered_decisions" ("application_reconsideration_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3738bed64a93f86c991a817324" ON "alcs"."application_reconsidered_decisions" ("application_decision_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3f4c060d437bb7f90902a4ec1c" ON "alcs"."application_modified_decisions" ("application_modification_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_00d76c4e26de94d450acd588fd" ON "alcs"."application_modified_decisions" ("application_decision_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_document" ADD CONSTRAINT "FK_7c22f4d93ffca5731e1b65d65c5" FOREIGN KEY ("decision_uuid") REFERENCES "alcs"."application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_document" ADD CONSTRAINT "FK_a504041180de5a04276594acf22" FOREIGN KEY ("document_uuid") REFERENCES "alcs"."document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_document" ADD CONSTRAINT "FK_9f9eadd4b16f8695e04f73ee727" FOREIGN KEY ("decision_uuid") REFERENCES "alcs"."notice_of_intent_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_document" ADD CONSTRAINT "FK_5cd9c5f049e6350d1335a31e6b9" FOREIGN KEY ("document_uuid") REFERENCES "alcs"."document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD CONSTRAINT "FK_d4a78fa6d709aace10890017271" FOREIGN KEY ("outcome_code") REFERENCES "alcs"."notice_of_intent_decision_outcome"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD CONSTRAINT "FK_eb09fa630463e673c99f3091e44" FOREIGN KEY ("notice_of_intent_uuid") REFERENCES "alcs"."notice_of_intent"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsidered_decisions" ADD CONSTRAINT "FK_bfb3d89d5587e33928949cc97d4" FOREIGN KEY ("application_reconsideration_uuid") REFERENCES "alcs"."application_reconsideration"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsidered_decisions" ADD CONSTRAINT "FK_3738bed64a93f86c991a817324b" FOREIGN KEY ("application_decision_uuid") REFERENCES "alcs"."application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modified_decisions" ADD CONSTRAINT "FK_3f4c060d437bb7f90902a4ec1c3" FOREIGN KEY ("application_modification_uuid") REFERENCES "alcs"."application_modification"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modified_decisions" ADD CONSTRAINT "FK_00d76c4e26de94d450acd588fd6" FOREIGN KEY ("application_decision_uuid") REFERENCES "alcs"."application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."is_subject_to_conditions" IS 'Indicates whether the decision is subject to conditions'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modified_decisions" DROP CONSTRAINT "FK_00d76c4e26de94d450acd588fd6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modified_decisions" DROP CONSTRAINT "FK_3f4c060d437bb7f90902a4ec1c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsidered_decisions" DROP CONSTRAINT "FK_3738bed64a93f86c991a817324b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsidered_decisions" DROP CONSTRAINT "FK_bfb3d89d5587e33928949cc97d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP CONSTRAINT "FK_eb09fa630463e673c99f3091e44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP CONSTRAINT "FK_d4a78fa6d709aace10890017271"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_document" DROP CONSTRAINT "FK_5cd9c5f049e6350d1335a31e6b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_document" DROP CONSTRAINT "FK_9f9eadd4b16f8695e04f73ee727"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_document" DROP CONSTRAINT "FK_a504041180de5a04276594acf22"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_document" DROP CONSTRAINT "FK_7c22f4d93ffca5731e1b65d65c5"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_00d76c4e26de94d450acd588fd"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_3f4c060d437bb7f90902a4ec1c"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_3738bed64a93f86c991a817324"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_bfb3d89d5587e33928949cc97d"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_158b067f2525c02879ff25b3d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "decision_date"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_6c08935ebe83afbea6a08c403c"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."notice_of_intent_decision"`);
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_decision_document"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_decision_outcome"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0e1b988c373de06ec277bca369" ON "alcs"."application_modified_decisions" ("application_decision_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_733d6d17b98e6b6d3cd8335910" ON "alcs"."application_modified_decisions" ("application_modification_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_09a58410db3f33249018127977" ON "alcs"."application_reconsidered_decisions" ("application_decision_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d7e09c1b2ce86005b7d0465215" ON "alcs"."application_reconsidered_decisions" ("application_reconsideration_uuid") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_9fd353dcf19ea98d0de8ff8be9" ON "alcs"."application_decision" ("resolution_number", "resolution_year") WHERE ((audit_deleted_date_at IS NULL) AND (resolution_number IS NOT NULL))`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modified_decisions" ADD CONSTRAINT "FK_0e1b988c373de06ec277bca3692" FOREIGN KEY ("application_decision_uuid") REFERENCES "alcs"."application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modified_decisions" ADD CONSTRAINT "FK_733d6d17b98e6b6d3cd83359101" FOREIGN KEY ("application_modification_uuid") REFERENCES "alcs"."application_modification"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsidered_decisions" ADD CONSTRAINT "FK_09a58410db3f332490181279771" FOREIGN KEY ("application_decision_uuid") REFERENCES "alcs"."application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsidered_decisions" ADD CONSTRAINT "FK_d7e09c1b2ce86005b7d0465215f" FOREIGN KEY ("application_reconsideration_uuid") REFERENCES "alcs"."application_reconsideration"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_document" ADD CONSTRAINT "FK_a86632c9a6ab56e984cf1cc9e6b" FOREIGN KEY ("decision_uuid") REFERENCES "alcs"."application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_document" ADD CONSTRAINT "FK_83717f1d73931fd18e810c03aa7" FOREIGN KEY ("document_uuid") REFERENCES "alcs"."document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."is_subject_to_conditions" IS NULL`,
    );
  }
}
