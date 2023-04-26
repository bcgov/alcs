import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCivicAddress1682012220105 implements MigrationInterface {
  name = 'addCivicAddress1682012220105';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD "civic_address" character varying`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_parcel"."civic_address" IS 'The standard address for the parcel'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP COLUMN "civic_address"`,
    );
  }
}
