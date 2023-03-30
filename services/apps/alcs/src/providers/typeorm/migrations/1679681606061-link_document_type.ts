import { MigrationInterface, QueryRunner } from 'typeorm';

export class linkDocumentType1679681606061 implements MigrationInterface {
  name = 'linkDocumentType1679681606061';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" RENAME COLUMN "type" TO "old_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ADD "type_code" text`,
    );

    await queryRunner.query(
      `UPDATE "alcs"."application_document" SET "type_code"='DPAC' WHERE "old_type"='decisionDocument'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_document" SET "type_code"='OTHR' WHERE "old_type"='reviewDocument'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_document" SET "type_code"='RESO' WHERE "old_type"='reviewResolutionDocument'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_document" SET "type_code"='STFF' WHERE "old_type"='reviewStaffReport'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_document" SET "type_code"='OTHR' WHERE "old_type"='reviewOther'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_document" SET "type_code"='CORS' WHERE "old_type"='corporateSummary'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_document" SET "type_code"='PROR' WHERE "old_type"='Professional Report'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_document" SET "type_code"='PHTO' WHERE "old_type"='Photograph'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_document" SET "type_code"='OTHR' WHERE "old_type"='Other'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_document" SET "type_code"='AAGR' WHERE "old_type"='authorizationLetter'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_document" SET "type_code"='CERT' WHERE "old_type"='certificateOfTitle'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_document" SET "type_code"='POSN' WHERE "old_type"='servingNotice'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_document" SET "type_code"='PRSK' WHERE "old_type"='proposalMap'`,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" DROP COLUMN "old_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ADD CONSTRAINT "FK_9c02077523dffbebc9727ecf823" FOREIGN KEY ("type_code") REFERENCES "alcs"."application_document_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //nope
  }
}
