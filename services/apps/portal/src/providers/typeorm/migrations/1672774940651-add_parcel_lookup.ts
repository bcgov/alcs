import { MigrationInterface, QueryRunner } from 'typeorm';

export class addParcelLookup1672774940651 implements MigrationInterface {
  name = 'addParcelLookup1672774940651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "portal"."parcel_lookup" ("ogc_fid" integer NOT NULL, "parcel_fab" numeric(10,0) NOT NULL, "global_uid" character varying(254) NOT NULL, "parcel_nam" character varying(50) NOT NULL, "plan_id" numeric(10,0) NOT NULL, "plan_numbe" character varying(128) NOT NULL, "pin" numeric(10,0) NOT NULL, "pid" character varying(9), "pid_format" character varying(254), "pid_number" numeric(10,0) NOT NULL, "source_par" character varying(50), "parcel_sta" character varying(20) NOT NULL, "parcel_cla" character varying(50) NOT NULL, "owner_type" character varying(50) NOT NULL, "parcel_s_1" date, "survey_des" character varying(30), "survey_d_1" character varying(30), "survey_d_2" character varying(30), "legal_desc" character varying(254), "municipali" character varying(254) NOT NULL, "regional_d" character varying(50) NOT NULL, "is_remaind" character varying(3), "geometry_s" character varying(50) NOT NULL, "positional" numeric(19,11) NOT NULL, "error_repo" character varying(50), "capture_me" character varying(50) NOT NULL, "compiled_i" character varying(5) NOT NULL, "stated_are" character varying(50), "when_creat" date NOT NULL, "when_updat" date NOT NULL, "feature_ar" numeric(19,11) NOT NULL, "feature_le" numeric(19,11) NOT NULL, "gis_area_h" numeric(19,11) NOT NULL, CONSTRAINT "PK_05d35752ed3797a624611d343f6" PRIMARY KEY ("ogc_fid")); COMMENT ON COLUMN "portal"."parcel_lookup"."pin" IS 'Pin of 0 means it has no Pin'; COMMENT ON COLUMN "portal"."parcel_lookup"."pid_number" IS '0 means it does not exist'`,
    );

    await queryRunner.query(
      `COMMENT ON TABLE "portal"."parcel_lookup" IS 'Imported GIS Data provided by Parcel Map BC'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "portal"."parcel_lookup"`);
  }
}
