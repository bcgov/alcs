import { MigrationInterface, QueryRunner } from 'typeorm';

export class landUseColumns1675103649509 implements MigrationInterface {
  name = 'landUseColumns1675103649509';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "parcels_agriculture_description" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."parcels_agriculture_description" IS 'Quantify and describe in detail all agriculture that currently takes place on the parcel(s).'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "parcels_agriculture_improvement_description" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."parcels_agriculture_improvement_description" IS 'Quantify and describe in detail all agricultural improvements made to the parcel(s).'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "parcels_non_agriculture_use_description" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."parcels_non_agriculture_use_description" IS 'Quantify and describe all non-agricultural uses that currently take place on the parcel(s).'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "north_land_use_type" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."north_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the North.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "north_land_use_type_description" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."north_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the North.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "east_land_use_type" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."east_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the East.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "east_land_use_type_description" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."east_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the East.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "south_land_use_type" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."south_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the South.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "south_land_use_type_description" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."south_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the South.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "west_land_use_type" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."west_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the West.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "west_land_use_type_description" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."west_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the West.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."west_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the West.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "west_land_use_type_description"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."west_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the West.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "west_land_use_type"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."south_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the South.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "south_land_use_type_description"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."south_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the South.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "south_land_use_type"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."east_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the East.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "east_land_use_type_description"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."east_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the East.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "east_land_use_type"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."north_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the North.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "north_land_use_type_description"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."north_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the North.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "north_land_use_type"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."parcels_non_agriculture_use_description" IS 'Quantify and describe all non-agricultural uses that currently take place on the parcel(s).'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "parcels_non_agriculture_use_description"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."parcels_agriculture_improvement_description" IS 'Quantify and describe in detail all agricultural improvements made to the parcel(s).'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "parcels_agriculture_improvement_description"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."parcels_agriculture_description" IS 'Quantify and describe in detail all agriculture that currently takes place on the parcel(s).'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "parcels_agriculture_description"`,
    );
  }
}
