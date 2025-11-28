import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChronologyEntryAuthor1763683662058 implements MigrationInterface {
  name = 'AddChronologyEntryAuthor1763683662058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_chronology_entry" ADD "author_uuid" uuid`);
    await queryRunner.query(
      `WITH inserted_users AS (
        INSERT INTO
          "alcs"."user" (
            uuid,
            audit_created_by,
            display_name,
            identity_provider,
            preferred_username,
            given_name,
            family_name
          )
        VALUES (
          '78cd5c8a-6935-4eea-be5c-46c08885bbba', -- Pre-generated, to avoid duplicating on every migration
          'migration_seed',
          'Testington McSample',
          'idir',
          'Testington McSample',
          'Testington',
          'McSample'
        )
        ON CONFLICT DO NOTHING
        RETURNING
          uuid
      )
      UPDATE
        "alcs"."compliance_and_enforcement_chronology_entry"
      SET
        "author_uuid" = inserted_users.uuid
      FROM
        inserted_users`,
    );
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_chronology_entry" ADD "author_uuid" uuid`);
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
