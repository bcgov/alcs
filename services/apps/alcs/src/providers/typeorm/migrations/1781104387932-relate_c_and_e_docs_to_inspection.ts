import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelateCAndEDocsToInspection1781104387932 implements MigrationInterface {
  name = 'RelateCAndEDocsToInspection1781104387932';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_document" ADD "inspection_uuid" uuid`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_inspection" DROP COLUMN "alleged_activity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_inspection" ADD "alleged_activity" "alcs"."compliance_and_enforcement_chronology_inspection_alleged_activity_enum" array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_inspection" ALTER COLUMN "attendees" SET DEFAULT '[]'::jsonb`,
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
      `ALTER TABLE "alcs"."compliance_and_enforcement_document" ADD CONSTRAINT "FK_d37ac07845dd354d95b27c4232c" FOREIGN KEY ("inspection_uuid") REFERENCES "alcs"."compliance_and_enforcement_chronology_inspection"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_document" DROP CONSTRAINT "FK_d37ac07845dd354d95b27c4232c"`,
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
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_inspection" ALTER COLUMN "attendees" SET DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_inspection" DROP COLUMN "alleged_activity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_inspection" ADD "alleged_activity" alcs.compliance_and_enforcement_chronology_inspection_alleged_activi array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_document" DROP COLUMN "inspection_uuid"`);
  }
}
