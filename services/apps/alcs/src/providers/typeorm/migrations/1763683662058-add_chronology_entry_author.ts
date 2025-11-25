import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChronologyEntryAuthor1763683662058 implements MigrationInterface {
  name = 'AddChronologyEntryAuthor1763683662058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_entry" ADD "author_uuid" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_entry" DROP COLUMN "nris_inspection_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_entry" ADD "nris_inspection_id" text`,
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
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_entry" ADD CONSTRAINT "FK_164d6ce38ac2bc929aff05737ce" FOREIGN KEY ("author_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_entry" DROP CONSTRAINT "FK_164d6ce38ac2bc929aff05737ce"`,
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
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_entry" DROP COLUMN "nris_inspection_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_entry" ADD "nris_inspection_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_entry" DROP COLUMN "author_uuid"`,
    );
  }
}
