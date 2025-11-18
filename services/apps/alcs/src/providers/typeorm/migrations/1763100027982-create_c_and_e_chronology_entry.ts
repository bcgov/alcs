import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCAndEChronologyEntry1763100027982 implements MigrationInterface {
  name = 'CreateCAndEChronologyEntry1763100027982';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."compliance_and_enforcement_chronology_entry" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "is_draft" boolean NOT NULL DEFAULT false, "date" TIMESTAMP WITH TIME ZONE, "description" text NOT NULL DEFAULT '', "file_uuid" uuid, CONSTRAINT "PK_08431834c0cf05174bf74ea46d6" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."compliance_and_enforcement_chronology_entry" IS 'Compliance and enforcement chronology entry'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_document" ADD "chronology_entry_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TYPE "alcs"."compliance_and_enforcement_document_section_enum" RENAME TO "compliance_and_enforcement_document_section_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "alcs"."compliance_and_enforcement_document_section_enum" AS ENUM('Submission', 'Ownership', 'Maps', 'Chronology Entry')`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_document" ALTER COLUMN "section" TYPE "alcs"."compliance_and_enforcement_document_section_enum" USING "section"::"text"::"alcs"."compliance_and_enforcement_document_section_enum"`,
    );
    await queryRunner.query(`DROP TYPE "alcs"."compliance_and_enforcement_document_section_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "alcs"."compliance_and_enforcement_responsible_party_foippa_category_en" RENAME TO "compliance_and_enforcement_responsible_party_foippa_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "alcs"."compliance_and_enforcement_responsible_party_foippa_category_enum" AS ENUM('Individual', 'Organization')`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_responsible_party" ALTER COLUMN "foippa_category" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_responsible_party" ALTER COLUMN "foippa_category" TYPE "alcs"."compliance_and_enforcement_responsible_party_foippa_category_enum" USING "foippa_category"::"text"::"alcs"."compliance_and_enforcement_responsible_party_foippa_category_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_responsible_party" ALTER COLUMN "foippa_category" SET DEFAULT 'Individual'`,
    );
    await queryRunner.query(`DROP TYPE "alcs"."compliance_and_enforcement_responsible_party_foippa_old"`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_entry" ADD CONSTRAINT "FK_ed2f4a6e73d3bb0c5f3312b3ce0" FOREIGN KEY ("file_uuid") REFERENCES "alcs"."compliance_and_enforcement"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_document" ADD CONSTRAINT "FK_75a6d25131969bb5f499365b2b9" FOREIGN KEY ("chronology_entry_uuid") REFERENCES "alcs"."compliance_and_enforcement_chronology_entry"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_document" DROP CONSTRAINT "FK_75a6d25131969bb5f499365b2b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_entry" DROP CONSTRAINT "FK_ed2f4a6e73d3bb0c5f3312b3ce0"`,
    );
    await queryRunner.query(
      `CREATE TYPE "alcs"."compliance_and_enforcement_responsible_party_foippa_old" AS ENUM('Individual', 'Organization')`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_responsible_party" ALTER COLUMN "foippa_category" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_responsible_party" ALTER COLUMN "foippa_category" TYPE "alcs"."compliance_and_enforcement_responsible_party_foippa_old" USING "foippa_category"::"text"::"alcs"."compliance_and_enforcement_responsible_party_foippa_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_responsible_party" ALTER COLUMN "foippa_category" SET DEFAULT 'Individual'`,
    );
    await queryRunner.query(`DROP TYPE "alcs"."compliance_and_enforcement_responsible_party_foippa_category_enum"`);
    await queryRunner.query(
      `ALTER TYPE "alcs"."compliance_and_enforcement_responsible_party_foippa_old" RENAME TO "compliance_and_enforcement_responsible_party_foippa_category_en"`,
    );
    await queryRunner.query(
      `CREATE TYPE "alcs"."compliance_and_enforcement_document_section_enum_old" AS ENUM('Submission', 'Ownership', 'Maps')`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_document" ALTER COLUMN "section" TYPE "alcs"."compliance_and_enforcement_document_section_enum_old" USING "section"::"text"::"alcs"."compliance_and_enforcement_document_section_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "alcs"."compliance_and_enforcement_document_section_enum"`);
    await queryRunner.query(
      `ALTER TYPE "alcs"."compliance_and_enforcement_document_section_enum_old" RENAME TO "compliance_and_enforcement_document_section_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_document" DROP COLUMN "chronology_entry_uuid"`,
    );
    await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_chronology_entry" IS NULL`);
    await queryRunner.query(`DROP TABLE "alcs"."compliance_and_enforcement_chronology_entry"`);
  }
}
