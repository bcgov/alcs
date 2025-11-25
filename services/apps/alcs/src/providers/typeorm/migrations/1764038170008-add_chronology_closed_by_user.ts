import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChronologyClosedByUser1764038170008 implements MigrationInterface {
  name = 'AddChronologyClosedByUser1764038170008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement" ADD "chronology_closed_by_uuid" uuid`);
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
      `ALTER TABLE "alcs"."compliance_and_enforcement" ADD CONSTRAINT "FK_3a21caa5cf341465504a6c50fd9" FOREIGN KEY ("chronology_closed_by_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement" DROP CONSTRAINT "FK_3a21caa5cf341465504a6c50fd9"`,
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
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement" DROP COLUMN "chronology_closed_by_uuid"`);
  }
}
