import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateParcelOwnerDocuments1680128186892
  implements MigrationInterface
{
  name = 'updateParcelOwnerDocuments1680128186892';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "alcs"."application_parcel_document"`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD "certificate_of_title_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD CONSTRAINT "UQ_4b5a4dca01e2f175fa448a734f9" UNIQUE ("certificate_of_title_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD CONSTRAINT "FK_4b5a4dca01e2f175fa448a734f9" FOREIGN KEY ("certificate_of_title_uuid") REFERENCES "alcs"."application_document"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `UPDATE "alcs"."application_owner" SET "corporate_summary_uuid" = NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP CONSTRAINT "FK_07928aa07dbb4cdb373be95cf02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD CONSTRAINT "FK_07928aa07dbb4cdb373be95cf02" FOREIGN KEY ("corporate_summary_uuid") REFERENCES "alcs"."application_document"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP CONSTRAINT "FK_07928aa07dbb4cdb373be95cf02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD CONSTRAINT "FK_07928aa07dbb4cdb373be95cf02" FOREIGN KEY ("corporate_summary_uuid") REFERENCES "alcs"."document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP CONSTRAINT "FK_4b5a4dca01e2f175fa448a734f9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP CONSTRAINT "UQ_4b5a4dca01e2f175fa448a734f9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP COLUMN "certificate_of_title_uuid"`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_parcel_document" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "type" character varying NOT NULL, "application_parcel_uuid" uuid NOT NULL, "document_uuid" uuid NOT NULL, CONSTRAINT "REL_66430bd7d2b199d4885a0d5a34" UNIQUE ("document_uuid"), CONSTRAINT "PK_2a0f8c3c86cecd1d79cf24e1da2" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."application_parcel_document"."application_parcel_uuid" IS 'Application parcel uuid'`,
    );
  }
}
