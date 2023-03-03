import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCrownTypeToParcel1677867792844 implements MigrationInterface {
  name = 'addCrownTypeToParcel1677867792844';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel" ADD "crown_land_owner_type" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application_parcel"."crown_land_owner_type" IS 'For Crown Land parcels to indicate whether they are provincially owned or federally owned'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel" DROP COLUMN "crown_land_owner_type"`,
    );
  }
}
