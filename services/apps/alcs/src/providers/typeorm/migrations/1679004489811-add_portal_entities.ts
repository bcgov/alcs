import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPortalEntities1679004489811 implements MigrationInterface {
  name = 'addPortalEntities1679004489811';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_parcel_document" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "type" character varying NOT NULL, "application_parcel_uuid" uuid NOT NULL, "document_uuid" uuid NOT NULL, CONSTRAINT "REL_66430bd7d2b199d4885a0d5a34" UNIQUE ("document_uuid"), CONSTRAINT "PK_2a0f8c3c86cecd1d79cf24e1da2" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."application_parcel_document"."application_parcel_uuid" IS 'Application parcel uuid'`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_parcel_ownership_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_e050bb4797be99f27d11cfaae2b" UNIQUE ("description"), CONSTRAINT "PK_33f7b06b2c4e0e128d670526c66" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_parcel" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "pid" character varying, "pin" character varying, "legal_description" character varying, "map_area_hectares" double precision, "is_farm" boolean, "purchased_date" TIMESTAMP WITH TIME ZONE, "is_confirmed_by_applicant" boolean NOT NULL DEFAULT false, "parcel_type" character varying NOT NULL DEFAULT 'application', "application_file_number" character varying NOT NULL, "ownership_type_code" text, "crown_land_owner_type" text, CONSTRAINT "PK_4c88659b418020abbb9b65fd4e0" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."application_parcel"."pid" IS 'The Parcels pid entered by the user or populated from third-party data'; COMMENT ON COLUMN "alcs"."application_parcel"."pin" IS 'The Parcels pin entered by the user or populated from third-party data'; COMMENT ON COLUMN "alcs"."application_parcel"."legal_description" IS 'The Parcels legalDescription entered by the user or populated from third-party data'; COMMENT ON COLUMN "alcs"."application_parcel"."map_area_hectares" IS 'The Parcels map are in hectares entered by the user or populated from third-party data'; COMMENT ON COLUMN "alcs"."application_parcel"."is_farm" IS 'The Parcels indication whether it is used as a farm'; COMMENT ON COLUMN "alcs"."application_parcel"."purchased_date" IS 'The Parcels purchase date provided by user'; COMMENT ON COLUMN "alcs"."application_parcel"."is_confirmed_by_applicant" IS 'The Parcels indication whether applicant signed off provided data including the Certificate of Title'; COMMENT ON COLUMN "alcs"."application_parcel"."parcel_type" IS 'The Parcels type, "other" means parcels not related to application but related to the owner'; COMMENT ON COLUMN "alcs"."application_parcel"."application_file_number" IS 'The application file id that parcel is linked to'; COMMENT ON COLUMN "alcs"."application_parcel"."crown_land_owner_type" IS 'For Crown Land parcels to indicate whether they are provincially owned or federally owned'`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_owner_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_1226285ea7299ecd8980e56ace8" UNIQUE ("description"), CONSTRAINT "PK_05181ec6491ee0aa527bd55c714" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_owner" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "first_name" character varying, "last_name" character varying, "organization_name" character varying, "phone_number" character varying, "email" character varying, "corporate_summary_uuid" uuid, "application_file_number" character varying NOT NULL, "type_code" text NOT NULL, CONSTRAINT "REL_07928aa07dbb4cdb373be95cf0" UNIQUE ("corporate_summary_uuid"), CONSTRAINT "PK_9b2fecd11351ea787e05900672d" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_status" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_ceabbf8054480a33932d3b6bbbc" UNIQUE ("description"), CONSTRAINT "PK_0c826eba913d2983a4ef7a0af79" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_proposal" ("file_number" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "applicant" character varying, "local_government_uuid" uuid, "returned_comment" text, "parcels_agriculture_description" text, "parcels_agriculture_improvement_description" text, "parcels_non_agriculture_use_description" text, "north_land_use_type" text, "north_land_use_type_description" text, "east_land_use_type" text, "east_land_use_type_description" text, "south_land_use_type" text, "south_land_use_type_description" text, "west_land_use_type" text, "west_land_use_type_description" text, "status_code" text NOT NULL, "primary_contact_owner_uuid" text, "type_code" character varying NOT NULL, "status_history" jsonb NOT NULL DEFAULT '[]', "has_other_parcels_in_community" boolean, "nfu_hectares" numeric(12,2), "nfu_purpose" text, "nfu_outside_lands" text, "nfu_agriculture_support" text, "nfu_will_import_fill" boolean, "nfu_total_fill_placement" numeric(12,2), "nfu_max_fill_depth" numeric(12,2), "nfu_fill_volume" numeric(12,2), "nfu_project_duration_amount" numeric(12,2), "nfu_project_duration_unit" text, "nfu_fill_type_description" text, "nfu_fill_origin_description" text, "tur_purpose" text, "tur_agricultural_activities" text, "tur_reduce_negative_impacts" text, "tur_outside_lands" text, "tur_total_corridor_area" numeric(12,2), "tur_all_owners_notified" boolean, "created_by_uuid" uuid, CONSTRAINT "PK_ae8c8d318236571a185d10fc3ec" PRIMARY KEY ("file_number")); COMMENT ON COLUMN "alcs"."application_proposal"."file_number" IS 'File Number generated by ALCS system'; COMMENT ON COLUMN "alcs"."application_proposal"."applicant" IS 'The Applicants name on the application'; COMMENT ON COLUMN "alcs"."application_proposal"."local_government_uuid" IS 'UUID from ALCS System of the Local Government'; COMMENT ON COLUMN "alcs"."application_proposal"."returned_comment" IS 'Used to store comments when an Application is returned to the Applicant'; COMMENT ON COLUMN "alcs"."application_proposal"."parcels_agriculture_description" IS 'Quantify and describe in detail all agriculture that currently takes place on the parcel(s).'; COMMENT ON COLUMN "alcs"."application_proposal"."parcels_agriculture_improvement_description" IS 'Quantify and describe in detail all agricultural improvements made to the parcel(s).'; COMMENT ON COLUMN "alcs"."application_proposal"."parcels_non_agriculture_use_description" IS 'Quantify and describe all non-agricultural uses that currently take place on the parcel(s).'; COMMENT ON COLUMN "alcs"."application_proposal"."north_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the North.'; COMMENT ON COLUMN "alcs"."application_proposal"."north_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the North.'; COMMENT ON COLUMN "alcs"."application_proposal"."east_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the East.'; COMMENT ON COLUMN "alcs"."application_proposal"."east_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the East.'; COMMENT ON COLUMN "alcs"."application_proposal"."south_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the South.'; COMMENT ON COLUMN "alcs"."application_proposal"."south_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the South.'; COMMENT ON COLUMN "alcs"."application_proposal"."west_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the West.'; COMMENT ON COLUMN "alcs"."application_proposal"."west_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the West.'; COMMENT ON COLUMN "alcs"."application_proposal"."primary_contact_owner_uuid" IS 'Stores Uuid of Owner Selected as Primary Contact'; COMMENT ON COLUMN "alcs"."application_proposal"."type_code" IS 'Application Type Code from ALCS System'; COMMENT ON COLUMN "alcs"."application_proposal"."status_history" IS 'JSONB Column containing the status history of the Application'; COMMENT ON COLUMN "alcs"."application_proposal"."has_other_parcels_in_community" IS 'Indicates whether application owners have other parcels in the community.'`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_proposal_review" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "local_government_file_number" text, "first_name" text, "last_name" text, "position" text, "department" text, "phone_number" text, "email" text, "is_ocp_designation" boolean, "ocp_bylaw_name" text, "ocp_designation" text, "ocp_consistent" boolean, "is_subject_to_zoning" boolean, "zoning_bylaw_name" text, "zoning_designation" text, "zoning_minimum_lot_size" text, "is_zoning_consistent" boolean, "is_authorized" boolean, "application_file_number" character varying NOT NULL, CONSTRAINT "REL_90f819c3318121a8046b61006c" UNIQUE ("application_file_number"), CONSTRAINT "PK_256c247ddeebdb96fca9421fb9f" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."parcel_lookup" ("objectid" integer NOT NULL, "global_uid" character varying(254) NOT NULL, "parcel_name" character varying(50) NOT NULL, "plan_number" character varying(128) NOT NULL, "pin" character varying(20), "pid" character varying(9), "pid_formatted" character varying(50), "pid_number" integer, "parcel_class" character varying(50) NOT NULL, "owner_type" character varying(50) NOT NULL, "legal_description" character varying, "municipality" character varying(254), "regional_district" character varying(50), "feature_area_sqm" double precision NOT NULL, "gis_area_ha" double precision NOT NULL, CONSTRAINT "PK_1671f67241727250919a9498855" PRIMARY KEY ("objectid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_930d5ab7b370ca6f8ab246f932" ON "alcs"."parcel_lookup" ("pin") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fa30a5bd1e389704da6e70e33b" ON "alcs"."parcel_lookup" ("pid") `,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_parcel_owners_application_owner" ("application_parcel_uuid" uuid NOT NULL, "application_owner_uuid" uuid NOT NULL, CONSTRAINT "PK_f1917966b23fc0cae577ab0a655" PRIMARY KEY ("application_parcel_uuid", "application_owner_uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_587cc07208988480adbbb7817c" ON "alcs"."application_parcel_owners_application_owner" ("application_parcel_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1aed17f119c6a3cb0b8d79a035" ON "alcs"."application_parcel_owners_application_owner" ("application_owner_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ADD "file_size" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ALTER COLUMN "type" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel_document" ADD CONSTRAINT "FK_31dce1c6fcd24fc6bd45824fea5" FOREIGN KEY ("application_parcel_uuid") REFERENCES "alcs"."application_parcel"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel_document" ADD CONSTRAINT "FK_66430bd7d2b199d4885a0d5a343" FOREIGN KEY ("document_uuid") REFERENCES "alcs"."document"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD CONSTRAINT "FK_803e574fe048adacb88443c8d45" FOREIGN KEY ("application_file_number") REFERENCES "alcs"."application_proposal"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD CONSTRAINT "FK_33f7b06b2c4e0e128d670526c66" FOREIGN KEY ("ownership_type_code") REFERENCES "alcs"."application_parcel_ownership_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD CONSTRAINT "FK_07928aa07dbb4cdb373be95cf02" FOREIGN KEY ("corporate_summary_uuid") REFERENCES "alcs"."document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD CONSTRAINT "FK_05181ec6491ee0aa527bd55c714" FOREIGN KEY ("type_code") REFERENCES "alcs"."application_owner_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD CONSTRAINT "FK_8104e51d0d9d1e920cd0f6df17c" FOREIGN KEY ("application_file_number") REFERENCES "alcs"."application_proposal"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_proposal" ADD CONSTRAINT "FK_85bf6ab2b82ea4a9193183d7b81" FOREIGN KEY ("created_by_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_proposal" ADD CONSTRAINT "FK_51932ec80542280d17270d91a3a" FOREIGN KEY ("status_code") REFERENCES "alcs"."application_status"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_proposal_review" ADD CONSTRAINT "FK_90f819c3318121a8046b61006cf" FOREIGN KEY ("application_file_number") REFERENCES "alcs"."application_proposal"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel_owners_application_owner" ADD CONSTRAINT "FK_587cc07208988480adbbb7817c3" FOREIGN KEY ("application_parcel_uuid") REFERENCES "alcs"."application_parcel"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel_owners_application_owner" ADD CONSTRAINT "FK_1aed17f119c6a3cb0b8d79a0350" FOREIGN KEY ("application_owner_uuid") REFERENCES "alcs"."application_owner"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel_owners_application_owner" DROP CONSTRAINT "FK_1aed17f119c6a3cb0b8d79a0350"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel_owners_application_owner" DROP CONSTRAINT "FK_587cc07208988480adbbb7817c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_proposal_review" DROP CONSTRAINT "FK_90f819c3318121a8046b61006cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_proposal" DROP CONSTRAINT "FK_51932ec80542280d17270d91a3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_proposal" DROP CONSTRAINT "FK_85bf6ab2b82ea4a9193183d7b81"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP CONSTRAINT "FK_8104e51d0d9d1e920cd0f6df17c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP CONSTRAINT "FK_05181ec6491ee0aa527bd55c714"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP CONSTRAINT "FK_07928aa07dbb4cdb373be95cf02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP CONSTRAINT "FK_33f7b06b2c4e0e128d670526c66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP CONSTRAINT "FK_803e574fe048adacb88443c8d45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel_document" DROP CONSTRAINT "FK_66430bd7d2b199d4885a0d5a343"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel_document" DROP CONSTRAINT "FK_31dce1c6fcd24fc6bd45824fea5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ALTER COLUMN "type" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" DROP COLUMN "file_size"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_1aed17f119c6a3cb0b8d79a035"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_587cc07208988480adbbb7817c"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_parcel_owners_application_owner"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_fa30a5bd1e389704da6e70e33b"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_930d5ab7b370ca6f8ab246f932"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."parcel_lookup"`);
    await queryRunner.query(`DROP TABLE "alcs"."application_proposal_review"`);
    await queryRunner.query(`DROP TABLE "alcs"."application_proposal"`);
    await queryRunner.query(`DROP TABLE "alcs"."application_status"`);
    await queryRunner.query(`DROP TABLE "alcs"."application_owner"`);
    await queryRunner.query(`DROP TABLE "alcs"."application_owner_type"`);
    await queryRunner.query(`DROP TABLE "alcs"."application_parcel"`);
    await queryRunner.query(
      `DROP TABLE "alcs"."application_parcel_ownership_type"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."application_parcel_document"`);
  }
}
