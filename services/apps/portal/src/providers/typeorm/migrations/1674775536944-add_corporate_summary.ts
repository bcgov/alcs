import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCorporateSummary1674775536944 implements MigrationInterface {
  name = 'addCorporateSummary1674775536944';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel_owners_application_owner" DROP CONSTRAINT "FK_1aed17f119c6a3cb0b8d79a0350"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_owner" ADD "corporate_summary_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_owner" ADD CONSTRAINT "UQ_07928aa07dbb4cdb373be95cf02" UNIQUE ("corporate_summary_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_owner" ADD CONSTRAINT "FK_07928aa07dbb4cdb373be95cf02" FOREIGN KEY ("corporate_summary_uuid") REFERENCES "portal"."document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel_owners_application_owner" ADD CONSTRAINT "FK_1aed17f119c6a3cb0b8d79a0350" FOREIGN KEY ("application_owner_uuid") REFERENCES "portal"."application_owner"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel_owners_application_owner" DROP CONSTRAINT "FK_1aed17f119c6a3cb0b8d79a0350"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_owner" DROP CONSTRAINT "FK_07928aa07dbb4cdb373be95cf02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_owner" DROP CONSTRAINT "UQ_07928aa07dbb4cdb373be95cf02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_owner" DROP COLUMN "corporate_summary_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel_owners_application_owner" ADD CONSTRAINT "FK_1aed17f119c6a3cb0b8d79a0350" FOREIGN KEY ("application_owner_uuid") REFERENCES "portal"."application_owner"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
