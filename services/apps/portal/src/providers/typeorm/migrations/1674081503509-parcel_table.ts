import { MigrationInterface, QueryRunner } from 'typeorm';

export class parcelTable1674081503509 implements MigrationInterface {
  name = 'parcelTable1674081503509';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "portal"."application_parcel_ownership_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_e050bb4797be99f27d11cfaae2b" UNIQUE ("description"), CONSTRAINT "PK_33f7b06b2c4e0e128d670526c66" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "portal"."application_parcel" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "pid" character varying, "pin" character varying, "legal_description" character varying, "map_area_hectares" double precision, "is_farm" boolean, "purchased_date" TIMESTAMP WITH TIME ZONE, "is_confirmed_by_applicant" boolean NOT NULL DEFAULT false, "application_file_number" character varying NOT NULL, "ownership_type_code" text, CONSTRAINT "PK_4c88659b418020abbb9b65fd4e0" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "portal"."application_parcel"."pid" IS 'The Parcels pid entered by the user or populated from third-party data'; COMMENT ON COLUMN "portal"."application_parcel"."pin" IS 'The Parcels pin entered by the user or populated from third-party data'; COMMENT ON COLUMN "portal"."application_parcel"."legal_description" IS 'The Parcels legalDescription entered by the user or populated from third-party data'; COMMENT ON COLUMN "portal"."application_parcel"."map_area_hectares" IS 'The Parcels map are in hectares entered by the user or populated from third-party data'; COMMENT ON COLUMN "portal"."application_parcel"."is_farm" IS 'The Parcels indication whether it is used as a farm'; COMMENT ON COLUMN "portal"."application_parcel"."purchased_date" IS 'The Parcels purchase date provided by user'; COMMENT ON COLUMN "portal"."application_parcel"."is_confirmed_by_applicant" IS 'The Parcels indication whether signed off entered data including the Certificate of Title'; COMMENT ON COLUMN "portal"."application_parcel"."application_file_number" IS 'The application file id that parcel is linked to'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel" ADD CONSTRAINT "FK_803e574fe048adacb88443c8d45" FOREIGN KEY ("application_file_number") REFERENCES "portal"."application"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel" ADD CONSTRAINT "FK_33f7b06b2c4e0e128d670526c66" FOREIGN KEY ("ownership_type_code") REFERENCES "portal"."application_parcel_ownership_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `INSERT INTO "portal"."application_parcel_ownership_type" 
                ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
                (NULL, NOW(), NULL, 'migration_seed', NULL, 'Fee Simple', 'SMPL', 'Fee Simple'),
                (NULL, NOW(), NULL, 'migration_seed', NULL, 'Crown', 'CRWN', 'Crown');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel" DROP CONSTRAINT "FK_33f7b06b2c4e0e128d670526c66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel" DROP CONSTRAINT "FK_803e574fe048adacb88443c8d45"`,
    );
    await queryRunner.query(`DROP TABLE "portal"."application_parcel"`);
    await queryRunner.query(
      `DROP TABLE "portal"."application_parcel_ownership_type"`,
    );
  }
}
