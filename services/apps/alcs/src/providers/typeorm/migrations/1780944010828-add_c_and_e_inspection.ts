import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCAndEInspection1780944010828 implements MigrationInterface {
  name = 'AddCAndEInspection1780944010828';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "alcs"."compliance_and_enforcement_chronology_inspection_type_enum" AS ENUM('Initial', 'Follow-up')`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."compliance_and_enforcement_chronology_inspection" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_draft" boolean NOT NULL DEFAULT true, "date" date, "type" "alcs"."compliance_and_enforcement_chronology_inspection_type_enum", "alleged_activity" "alcs"."compliance_and_enforcement_chronology_inspection_alleged_activity_enum" array NOT NULL DEFAULT '{}', "attendees" jsonb NOT NULL DEFAULT '[]'::jsonb, "comments" text NOT NULL DEFAULT '', "officer_uuid" uuid, "entry_uuid" uuid, CONSTRAINT "PK_a6fef47f253d5253779603e5d96" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."compliance_and_enforcement_chronology_inspection" IS 'Compliance and enforcement chronology entry'`,
    );
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
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_inspection" ADD CONSTRAINT "FK_70ca3e3a66229356bc2688bf72d" FOREIGN KEY ("officer_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_inspection" ADD CONSTRAINT "FK_e72cfe78331de4c37736f6c2eaf" FOREIGN KEY ("entry_uuid") REFERENCES "alcs"."compliance_and_enforcement_chronology_entry"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_inspection" DROP CONSTRAINT "FK_e72cfe78331de4c37736f6c2eaf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_inspection" DROP CONSTRAINT "FK_70ca3e3a66229356bc2688bf72d"`,
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
    await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_chronology_inspection" IS NULL`);
    await queryRunner.query(`DROP TABLE "alcs"."compliance_and_enforcement_chronology_inspection"`);
    await queryRunner.query(`DROP TYPE "alcs"."compliance_and_enforcement_chronology_inspection_type_enum"`);
  }
}
