import { MigrationInterface, QueryRunner } from 'typeorm';

export class Inquiry1710371089218 implements MigrationInterface {
  name = 'Inquiry1710371089218';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."inquiry_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, "short_label" character varying NOT NULL, "background_color" character varying NOT NULL, "text_color" character varying NOT NULL, "html_description" text NOT NULL DEFAULT '', CONSTRAINT "UQ_9caab940baead9499eae4fd0ed8" UNIQUE ("description"), CONSTRAINT "PK_1a0ca48142efa882f687fbed1a4" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."inquiry" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "summary" text NOT NULL, "submitted_to_alc_date" TIMESTAMP WITH TIME ZONE NOT NULL, "inquirer_first_name" character varying, "inquirer_last_name" text, "inquirer_organization" text, "inquirer_phone" text, "inquirer_email" text, "open" boolean NOT NULL DEFAULT true, "closed_date" TIMESTAMP WITH TIME ZONE, "local_government_uuid" uuid NOT NULL, "region_code" text NOT NULL, "type_code" text NOT NULL, "card_uuid" uuid NOT NULL, "closed_by_uuid" uuid, CONSTRAINT "REL_217c73ca560363e2391d59ef75" UNIQUE ("card_uuid"), CONSTRAINT "PK_6063787da196f8f53f968ace0d0" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3b17d9cc412828dd0f1b416481" ON "alcs"."inquiry" ("local_government_uuid") `,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."inquiry_parcel" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "pid" text, "pin" text, "civic_address" character varying NOT NULL, "inquiry_uuid" uuid NOT NULL, CONSTRAINT "PK_2e38295de61ab5e9f2f5b222c37" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."inquiry_parcel"."pid" IS 'The Parcels pid entered by the user or populated from third-party data'; COMMENT ON COLUMN "alcs"."inquiry_parcel"."pin" IS 'The Parcels pin entered by the user or populated from third-party data'; COMMENT ON COLUMN "alcs"."inquiry_parcel"."civic_address" IS 'The standard address for the parcel'`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."inquiry_document" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "type_code" text, "inquiry_uuid" uuid NOT NULL, "document_uuid" uuid, CONSTRAINT "REL_fbb716772d7eff5b5fb454bb26" UNIQUE ("document_uuid"), CONSTRAINT "PK_e3fda23cbde427b27e20d70fb5f" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ee43ebfd0d1cb4148331c2ac9" ON "alcs"."inquiry_document" ("inquiry_uuid") `,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."inquiry_document" IS 'Stores inquiry documents'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_document"."oats_application_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.alr_application to alcs.notification_document.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" ADD CONSTRAINT "FK_3fcfda215d023cf892bf0b3048a" FOREIGN KEY ("closed_by_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" ADD CONSTRAINT "FK_3b17d9cc412828dd0f1b4164818" FOREIGN KEY ("local_government_uuid") REFERENCES "alcs"."local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" ADD CONSTRAINT "FK_40858ba1a310330fdea4d56a85c" FOREIGN KEY ("region_code") REFERENCES "alcs"."application_region"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" ADD CONSTRAINT "FK_1a0ca48142efa882f687fbed1a4" FOREIGN KEY ("type_code") REFERENCES "alcs"."inquiry_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" ADD CONSTRAINT "FK_217c73ca560363e2391d59ef75d" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_parcel" ADD CONSTRAINT "FK_593a8419d704330268b92565f3a" FOREIGN KEY ("inquiry_uuid") REFERENCES "alcs"."inquiry"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_document" ADD CONSTRAINT "FK_57359f6ad774ef7a18ebed83d13" FOREIGN KEY ("type_code") REFERENCES "alcs"."document_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_document" ADD CONSTRAINT "FK_1ee43ebfd0d1cb4148331c2ac9d" FOREIGN KEY ("inquiry_uuid") REFERENCES "alcs"."inquiry"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_document" ADD CONSTRAINT "FK_fbb716772d7eff5b5fb454bb267" FOREIGN KEY ("document_uuid") REFERENCES "alcs"."document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_document" DROP CONSTRAINT "FK_fbb716772d7eff5b5fb454bb267"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_document" DROP CONSTRAINT "FK_1ee43ebfd0d1cb4148331c2ac9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_document" DROP CONSTRAINT "FK_57359f6ad774ef7a18ebed83d13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_parcel" DROP CONSTRAINT "FK_593a8419d704330268b92565f3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" DROP CONSTRAINT "FK_217c73ca560363e2391d59ef75d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" DROP CONSTRAINT "FK_1a0ca48142efa882f687fbed1a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" DROP CONSTRAINT "FK_40858ba1a310330fdea4d56a85c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" DROP CONSTRAINT "FK_3b17d9cc412828dd0f1b4164818"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" DROP CONSTRAINT "FK_3fcfda215d023cf892bf0b3048a"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_document"."oats_application_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.notification_document.'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."inquiry_document" IS NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_1ee43ebfd0d1cb4148331c2ac9"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."inquiry_document"`);
    await queryRunner.query(`DROP TABLE "alcs"."inquiry_parcel"`);
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_3b17d9cc412828dd0f1b416481"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."inquiry"`);
    await queryRunner.query(`DROP TABLE "alcs"."inquiry_type"`);
  }
}
