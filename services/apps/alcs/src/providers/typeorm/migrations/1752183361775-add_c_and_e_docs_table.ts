import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCAndEDocsTable1752183361775 implements MigrationInterface {
  name = 'AddCAndEDocsTable1752183361775';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      CREATE TABLE
        "alcs"."compliance_and_enforcement_document" (
            "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
            "type_code" text,
            "file_uuid" uuid NOT NULL,
            "document_uuid" uuid,
            CONSTRAINT "REL_8f67dae9787b42bef912292716" UNIQUE ("document_uuid"),
            CONSTRAINT "PK_74f7873502cb0bce8ceeb8cd23a" PRIMARY KEY ("uuid")
        )
      `,
    );
    await queryRunner.query(
      `
      COMMENT ON TABLE
        "alcs"."compliance_and_enforcement_document"
      IS
        'Links complaint/referral documents with the complaint/referral they''re saved to and logs other attributes'
      `,
    );
    await queryRunner.query(
      `
      ALTER TABLE
        "alcs"."compliance_and_enforcement_document"
      ADD CONSTRAINT
        "FK_da7a7aac5231d436c65d48f206c"
      FOREIGN KEY
        ("type_code")
      REFERENCES
        "alcs"."document_code"("code")
      ON DELETE NO ACTION ON UPDATE NO ACTION
      `,
    );
    await queryRunner.query(
      `
      ALTER TABLE
        "alcs"."compliance_and_enforcement_document"
      ADD CONSTRAINT
        "FK_742e4bd7ac2910362a1e9e57db7"
      FOREIGN KEY
        ("file_uuid")
      REFERENCES
        "alcs"."compliance_and_enforcement"("uuid")
      ON DELETE NO ACTION ON UPDATE NO ACTION
      `,
    );
    await queryRunner.query(
      `
      ALTER TABLE
        "alcs"."compliance_and_enforcement_document"
      ADD CONSTRAINT
        "FK_8f67dae9787b42bef9122927167"
      FOREIGN KEY
        ("document_uuid")
      REFERENCES
        "alcs"."document"("uuid")
      ON DELETE NO ACTION ON UPDATE NO ACTION
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      ALTER TABLE
        "alcs"."compliance_and_enforcement_document"
      DROP CONSTRAINT
        "FK_8f67dae9787b42bef9122927167"
      `,
    );
    await queryRunner.query(
      `
      ALTER TABLE
        "alcs"."compliance_and_enforcement_document"
      DROP CONSTRAINT
        "FK_742e4bd7ac2910362a1e9e57db7"
      `,
    );
    await queryRunner.query(
      `
      ALTER TABLE
        "alcs"."compliance_and_enforcement_document"
      DROP CONSTRAINT
        "FK_da7a7aac5231d436c65d48f206c"
      `,
    );
    await queryRunner.query(
      `
      COMMENT ON TABLE
        "alcs"."compliance_and_enforcement_document"
      IS NULL
      `,
    );
    await queryRunner.query(
      `
      DROP TABLE
        "alcs"."compliance_and_enforcement_document"
      `,
    );
  }
}
