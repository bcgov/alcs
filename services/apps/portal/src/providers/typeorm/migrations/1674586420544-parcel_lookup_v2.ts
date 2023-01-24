import { MigrationInterface, QueryRunner } from 'typeorm';

export class parcelLookupV21674586420544 implements MigrationInterface {
  name = 'parcelLookupV21674586420544';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "portal"."parcel_lookup"`);
    await queryRunner.query(
      `CREATE TABLE "portal"."parcel_lookup" (
        "objectid" integer NOT NULL,
        "global_uid" character varying(254) NOT NULL,
        "parcel_name" character varying(50) NOT NULL,
        "plan_number" character varying(128) NOT NULL,
        "pin" character varying(20),
        "pid" character varying(9),
        "pid_formatted" character varying(50),
        "pid_number" integer,
        "parcel_class" character varying(50) NOT NULL,
        "owner_type" character varying(50) NOT NULL,
        "legal_description" character varying,
        "municipality" character varying(254),
        "regional_district" character varying(50),
        "feature_area_sqm" double precision NOT NULL,
        "gis_area_ha" double precision NOT NULL,
        CONSTRAINT "PK_1671f67241727250919a9498855" PRIMARY KEY ("objectid")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fa30a5bd1e389704da6e70e33b" ON "portal"."parcel_lookup" ("pid")`,
    );
  }

  public async down(): Promise<void> {
    //Not Supported as table was never used
  }
}
