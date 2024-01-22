import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoiDocuments1691082860193 implements MigrationInterface {
  name = 'addNoiDocuments1691082860193';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" DROP CONSTRAINT "FK_9c02077523dffbebc9727ecf823"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document_code" RENAME TO "document_code"`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_document" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "type_code" text, "description" text, "notice_of_intent_uuid" uuid NOT NULL, "document_uuid" uuid, "visibility_flags" text array NOT NULL DEFAULT '{}', "oats_document_id" text, "oats_application_id" text, "audit_created_by" text, CONSTRAINT "OATS_NOI_UQ_DOCUMENTS" UNIQUE ("oats_document_id", "oats_application_id"), CONSTRAINT "REL_be3bff8cd4ff2275f9a5a8e880" UNIQUE ("document_uuid"), CONSTRAINT "PK_6463ef00f1ec1842240b3c2e29a" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."notice_of_intent_document"."oats_document_id" IS 'used only for oats etl process'; COMMENT ON COLUMN "alcs"."notice_of_intent_document"."oats_application_id" IS 'used only for oats etl process'; COMMENT ON COLUMN "alcs"."notice_of_intent_document"."audit_created_by" IS 'used only for oats etl process'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ADD CONSTRAINT "FK_9c02077523dffbebc9727ecf823" FOREIGN KEY ("type_code") REFERENCES "alcs"."document_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_document" ADD CONSTRAINT "FK_1bb9a71eab11ae830030ca24233" FOREIGN KEY ("type_code") REFERENCES "alcs"."document_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_document" ADD CONSTRAINT "FK_5f66a229039f4b95f461cb54cba" FOREIGN KEY ("notice_of_intent_uuid") REFERENCES "alcs"."notice_of_intent"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_document" ADD CONSTRAINT "FK_be3bff8cd4ff2275f9a5a8e880b" FOREIGN KEY ("document_uuid") REFERENCES "alcs"."document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_document" DROP CONSTRAINT "FK_be3bff8cd4ff2275f9a5a8e880b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_document" DROP CONSTRAINT "FK_5f66a229039f4b95f461cb54cba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_document" DROP CONSTRAINT "FK_1bb9a71eab11ae830030ca24233"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" DROP CONSTRAINT "FK_9c02077523dffbebc9727ecf823"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document_code" RENAME TO "alcs"."application_document_code"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."notice_of_intent_document"`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ADD CONSTRAINT "FK_9c02077523dffbebc9727ecf823" FOREIGN KEY ("type_code") REFERENCES "alcs"."application_document_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
