import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoiSubmissionParcelsAndOwners1691692339215
  implements MigrationInterface
{
  name = 'addNoiSubmissionParcelsAndOwners1691692339215';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP CONSTRAINT "FK_05181ec6491ee0aa527bd55c714"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner_type" RENAME TO "owner_type"`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_parcel_ownership_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_a7d503e16b2d7a04680dbfdcb59" UNIQUE ("description"), CONSTRAINT "PK_7b23cfdc8574f66dd2f88e37f3f" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_parcel" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "pid" character varying, "pin" character varying, "legal_description" character varying, "civic_address" character varying, "map_area_hectares" double precision, "is_farm" boolean, "purchased_date" TIMESTAMP WITH TIME ZONE, "is_confirmed_by_applicant" boolean NOT NULL DEFAULT false, "notice_of_intent_submission_uuid" uuid NOT NULL, "ownership_type_code" text, "crown_land_owner_type" text, "certificate_of_title_uuid" uuid, "alr_area" numeric(12,2), CONSTRAINT "PK_6cfd592c4237000793b5a891aa7" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."notice_of_intent_parcel"."pid" IS 'The Parcels pid entered by the user or populated from third-party data'; COMMENT ON COLUMN "alcs"."notice_of_intent_parcel"."pin" IS 'The Parcels pin entered by the user or populated from third-party data'; COMMENT ON COLUMN "alcs"."notice_of_intent_parcel"."legal_description" IS 'The Parcels legalDescription entered by the user or populated from third-party data'; COMMENT ON COLUMN "alcs"."notice_of_intent_parcel"."civic_address" IS 'The standard address for the parcel'; COMMENT ON COLUMN "alcs"."notice_of_intent_parcel"."map_area_hectares" IS 'The Parcels map are in hectares entered by the user or populated from third-party data'; COMMENT ON COLUMN "alcs"."notice_of_intent_parcel"."is_farm" IS 'The Parcels indication whether it is used as a farm'; COMMENT ON COLUMN "alcs"."notice_of_intent_parcel"."purchased_date" IS 'The Parcels purchase date provided by user'; COMMENT ON COLUMN "alcs"."notice_of_intent_parcel"."is_confirmed_by_applicant" IS 'The Parcels indication whether applicant signed off provided data including the Certificate of Title'; COMMENT ON COLUMN "alcs"."notice_of_intent_parcel"."crown_land_owner_type" IS 'For Crown Land parcels to indicate whether they are provincially owned or federally owned'`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_owner" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "first_name" character varying, "last_name" character varying, "organization_name" character varying, "phone_number" character varying, "email" character varying, "corporate_summary_uuid" uuid, "notice_of_intent_submission_uuid" uuid NOT NULL, "type_code" text NOT NULL, CONSTRAINT "PK_057d19217ea35bb20b4b7e7ed43" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_parcel_owners_notice_of_intent_owner" ("notice_of_intent_parcel_uuid" uuid NOT NULL, "notice_of_intent_owner_uuid" uuid NOT NULL, CONSTRAINT "PK_62cbd3e4f1802f240c40b1c37f8" PRIMARY KEY ("notice_of_intent_parcel_uuid", "notice_of_intent_owner_uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a419bb29b4bdb7e5d4aa4181d1" ON "alcs"."notice_of_intent_parcel_owners_notice_of_intent_owner" ("notice_of_intent_parcel_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4346ccc22b3ca8dafe57b25128" ON "alcs"."notice_of_intent_parcel_owners_notice_of_intent_owner" ("notice_of_intent_owner_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD CONSTRAINT "FK_05181ec6491ee0aa527bd55c714" FOREIGN KEY ("type_code") REFERENCES "alcs"."owner_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" ADD CONSTRAINT "FK_8d14440209af146e7f351c7fbef" FOREIGN KEY ("notice_of_intent_submission_uuid") REFERENCES "alcs"."notice_of_intent_submission"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" ADD CONSTRAINT "FK_7b23cfdc8574f66dd2f88e37f3f" FOREIGN KEY ("ownership_type_code") REFERENCES "alcs"."notice_of_intent_parcel_ownership_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" ADD CONSTRAINT "FK_7b405f7700af3398ec38b70d634" FOREIGN KEY ("certificate_of_title_uuid") REFERENCES "alcs"."notice_of_intent_document"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_owner" ADD CONSTRAINT "FK_a27c5e1999ea94ce0dc0c923fb3" FOREIGN KEY ("corporate_summary_uuid") REFERENCES "alcs"."notice_of_intent_document"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_owner" ADD CONSTRAINT "FK_016562c9faf2b0d0ccc96212ee0" FOREIGN KEY ("type_code") REFERENCES "alcs"."owner_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_owner" ADD CONSTRAINT "FK_df0c33df4e8ce83089e0645e928" FOREIGN KEY ("notice_of_intent_submission_uuid") REFERENCES "alcs"."notice_of_intent_submission"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel_owners_notice_of_intent_owner" ADD CONSTRAINT "FK_a419bb29b4bdb7e5d4aa4181d11" FOREIGN KEY ("notice_of_intent_parcel_uuid") REFERENCES "alcs"."notice_of_intent_parcel"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel_owners_notice_of_intent_owner" ADD CONSTRAINT "FK_4346ccc22b3ca8dafe57b251280" FOREIGN KEY ("notice_of_intent_owner_uuid") REFERENCES "alcs"."notice_of_intent_owner"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel_owners_notice_of_intent_owner" DROP CONSTRAINT "FK_4346ccc22b3ca8dafe57b251280"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel_owners_notice_of_intent_owner" DROP CONSTRAINT "FK_a419bb29b4bdb7e5d4aa4181d11"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_owner" DROP CONSTRAINT "FK_df0c33df4e8ce83089e0645e928"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_owner" DROP CONSTRAINT "FK_016562c9faf2b0d0ccc96212ee0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_owner" DROP CONSTRAINT "FK_a27c5e1999ea94ce0dc0c923fb3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" DROP CONSTRAINT "FK_7b405f7700af3398ec38b70d634"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" DROP CONSTRAINT "FK_7b23cfdc8574f66dd2f88e37f3f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" DROP CONSTRAINT "FK_8d14440209af146e7f351c7fbef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP CONSTRAINT "FK_05181ec6491ee0aa527bd55c714"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_4346ccc22b3ca8dafe57b25128"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_a419bb29b4bdb7e5d4aa4181d1"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_parcel_owners_notice_of_intent_owner"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."notice_of_intent_owner"`);
    await queryRunner.query(`DROP TABLE "alcs"."notice_of_intent_parcel"`);
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_parcel_ownership_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."owner_type" RENAME TO "application_owner_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD CONSTRAINT "FK_05181ec6491ee0aa527bd55c714" FOREIGN KEY ("type_code") REFERENCES "alcs"."application_owner_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
