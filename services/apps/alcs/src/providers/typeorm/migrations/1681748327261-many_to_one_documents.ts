import { MigrationInterface, QueryRunner } from 'typeorm';

export class manyToOneDocuments1681748327261 implements MigrationInterface {
  name = 'manyToOneDocuments1681748327261';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP CONSTRAINT "UQ_4b5a4dca01e2f175fa448a734f9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP CONSTRAINT "FK_07928aa07dbb4cdb373be95cf02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP CONSTRAINT "REL_07928aa07dbb4cdb373be95cf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD CONSTRAINT "FK_4b5a4dca01e2f175fa448a734f9" FOREIGN KEY ("certificate_of_title_uuid") REFERENCES "alcs"."application_document"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`,
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
      `ALTER TABLE "alcs"."application_parcel" DROP CONSTRAINT "FK_4b5a4dca01e2f175fa448a734f9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD CONSTRAINT "REL_07928aa07dbb4cdb373be95cf0" UNIQUE ("corporate_summary_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD CONSTRAINT "FK_07928aa07dbb4cdb373be95cf02" FOREIGN KEY ("corporate_summary_uuid") REFERENCES "alcs"."application_document"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD CONSTRAINT "UQ_4b5a4dca01e2f175fa448a734f9" UNIQUE ("certificate_of_title_uuid")`,
    );
  }
}
