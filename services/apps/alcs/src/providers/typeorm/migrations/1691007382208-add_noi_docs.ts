import { MigrationInterface, QueryRunner } from "typeorm"

export class addNoiDocs1691007382208 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "alcs"."noi_document" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_created_by" text, "evidentiary_record_sorting" integer, "oats_document_id" text, "oats_application_id" text, "type" character varying NOT NULL, "visibility_flags" text array NOT NULL DEFAULT '{}', "application_uuid" uuid NOT NULL, "description" text, "document_uuid" uuid, CONSTRAINT "REL_17be9d534322486d932567196a62725e" UNIQUE ("document_uuid"), CONSTRAINT "PK_aa8a0b4ce8474054afe73e949c2d88f5" PRIMARY KEY ("uuid"))`,
          );
        await queryRunner.query(
            `ALTER TABLE "alcs"."noi_document" ADD CONSTRAINT "FK_703514379dc945f3bfc0d8e897d88086" FOREIGN KEY ("application_uuid") REFERENCES "alcs"."noi"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
          );
        await queryRunner.query(
            `ALTER TABLE "alcs"."noi_document" ADD CONSTRAINT "FK_be9edc8bd1864d20be37058fba08199b" FOREIGN KEY ("document_uuid") REFERENCES "alcs"."document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
          );
        await queryRunner.query(
            `ALTER TABLE "alcs"."noi_document" ALTER COLUMN "type" DROP NOT NULL`,
          );
        await queryRunner.query(
            `ALTER TABLE "alcs"."noi_document" ADD CONSTRAINT "FK_d5b10b5343374bf58cde7be5cefdcbdd" FOREIGN KEY ("type_code") REFERENCES "alcs"."application_document_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
          );
        await queryRunner.query(`
            COMMENT ON COLUMN "alcs"."noi_document"."oats_document_id" IS 'used only for oats etl process';
            COMMENT ON COLUMN "alcs"."noi_document"."oats_application_id" IS 'used only for oats etl process';
            COMMENT ON COLUMN "alcs"."noi_document"."audit_created_by" IS 'used only for oats etl process';
            COMMENT ON TABLE "alcs"."noi_document" IS 'Links noi documents with the noi they''re saved to and logs other attributes';
            `,
          );
        await queryRunner.query(
            `ALTER TABLE "alcs"."noi_document" ADD CONSTRAINT "OATS_UNQ_DOCUMENTS" UNIQUE ("oats_document_id", "oats_application_id")`,
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "alcs"."noi_document" DROP CONSTRAINT "REL_17be9d534322486d932567196a62725e";
            ALTER TABLE "alcs"."noi_document" DROP CONSTRAINT "PK_aa8a0b4ce8474054afe73e949c2d88f5";
            ALTER TABLE "alcs"."noi_document" DROP CONSTRAINT "FK_703514379dc945f3bfc0d8e897d88086";
            ALTER TABLE "alcs"."noi_document" DROP CONSTRAINT "FK_be9edc8bd1864d20be37058fba08199b";
            ALTER TABLE "alcs"."noi_document" DROP CONSTRAINT "FK_d5b10b5343374bf58cde7be5cefdcbdd";
            ALTER TABLE "alcs"."noi_document" DROP CONSTRAINT "OATS_UNQ_DOCUMENTS";
            DROP TABLE "alcs"."noi_document"
            `,
        
        );
    }

}
