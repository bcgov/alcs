import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelateGovToCAndEProperty1755105193848 implements MigrationInterface {
  name = 'RelateGovToCAndEProperty1755105193848';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_property" DROP COLUMN "local_government_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_property" ADD "local_government_uuid" uuid`,
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
      `ALTER TABLE "alcs"."compliance_and_enforcement_property" ADD CONSTRAINT "FK_fd32a50355c3d4ddefbe28df276" FOREIGN KEY ("local_government_uuid") REFERENCES "alcs"."local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_property" DROP CONSTRAINT "FK_fd32a50355c3d4ddefbe28df276"`,
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
      `ALTER TABLE "alcs"."compliance_and_enforcement_property" DROP COLUMN "local_government_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_property" ADD "local_government_uuid" text NOT NULL DEFAULT ''`,
    );
  }
}
