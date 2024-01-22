import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteParcelType1701731117179 implements MigrationInterface {
  name = 'DeleteParcelType1701731117179';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."application_parcel_owners_application_owner"
      WHERE "application_parcel_uuid" IN(
        SELECT
          uuid FROM "alcs"."application_parcel"
        WHERE
          "parcel_type" = 'other');`,
    );

    await queryRunner.query(
      `DELETE FROM "alcs"."application_parcel" WHERE "parcel_type" = 'other'`,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP COLUMN "parcel_type"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD "parcel_type" character varying NOT NULL DEFAULT 'application'`,
    );
  }
}
