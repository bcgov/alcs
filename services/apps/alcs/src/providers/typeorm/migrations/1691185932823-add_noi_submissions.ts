import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoiSubmissions1691185932823 implements MigrationInterface {
  name = 'addNoiSubmissions1691185932823';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP CONSTRAINT "FK_58853fcb8957e8b2c131cc12da1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."covenant" DROP CONSTRAINT "FK_0fa742d800bc0e0b3f2451e0f0b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP CONSTRAINT "FK_7e78db4d1c5afb16374253b42d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP CONSTRAINT "FK_5a57c8d407eb6132ed39cb8fe6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_local_government" RENAME TO "local_government"`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, "short_label" character varying NOT NULL, "html_description" text NOT NULL DEFAULT '', "portal_label" text NOT NULL DEFAULT '', CONSTRAINT "UQ_2a02e4d5838272a54b4a9f7c9c8" UNIQUE ("description"), CONSTRAINT "PK_7b4b618e6aaf6c0205d36a5e2ca" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_submission" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "file_number" character varying NOT NULL, "is_draft" boolean NOT NULL DEFAULT false, "applicant" character varying, "local_government_uuid" uuid, "purpose" character varying, "parcels_agriculture_description" text, "parcels_agriculture_improvement_description" text, "parcels_non_agriculture_use_description" text, "north_land_use_type" text, "north_land_use_type_description" text, "east_land_use_type" text, "east_land_use_type_description" text, "south_land_use_type" text, "south_land_use_type_description" text, "west_land_use_type" text, "west_land_use_type_description" text, "primary_contact_owner_uuid" text, "type_code" character varying NOT NULL, "created_by_uuid" uuid, CONSTRAINT "PK_373b13feac5362050544ee1dd62" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."file_number" IS 'File Number of attached application'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."is_draft" IS 'Indicates whether submission is currently draft or not'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."applicant" IS 'The Applicants name on the application'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."local_government_uuid" IS 'UUID from ALCS System of the Local Government'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."purpose" IS 'The Applicants name on the application'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."parcels_agriculture_description" IS 'Quantify and describe in detail all agriculture that currently takes place on the parcel(s).'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."parcels_agriculture_improvement_description" IS 'Quantify and describe in detail all agricultural improvements made to the parcel(s).'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."parcels_non_agriculture_use_description" IS 'Quantify and describe all non-agricultural uses that currently take place on the parcel(s).'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."north_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the North.'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."north_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the North.'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."east_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the East.'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."east_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the East.'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."south_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the South.'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."south_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the South.'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."west_land_use_type" IS 'The land uses surrounding the parcel(s) under application on the West.'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."west_land_use_type_description" IS 'Description of the land uses surrounding the parcel(s) under application on the West.'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."primary_contact_owner_uuid" IS 'Stores Uuid of Owner Selected as Primary Contact'; COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."type_code" IS 'Notice of Intent Type Code'`,
    );

    //Add a type
    await queryRunner.query(`
      INSERT INTO "alcs"."notice_of_intent_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "short_label", "html_description", "portal_label") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Placement of Fill', 'POFO', 'Placement of Fill Only', 'SOIL', 'Choose this option if you are <strong>only</strong> proposing to place fill on ALR land under
        <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section20.3">Section 20.3(1)(c) of the Agricultural Land Commission Act.</a>
        <br /><br />
        Fill includes but is not limited to:
        <ul>
            <li>Aggregate</li>
            <li>Topsoil</li>
            <li>Structural Fill</li>
            <li>Sand</li>
            <li>Gravel</li>
        </ul>     
      ', 'Placement of Fill within the ALR'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Placement of Fill/Removal of Soil', 'PFRS', 'Placement of Fill and Removal of Soil', 'SOIL', 'Choose this option if you are proposing to remove soil <strong>and</strong> place fill on ALR land under
        <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section20.3">Section 20.3(1)(c) of the Agricultural Land Commission Act.</a>
        <br /><br />
        Soil includes but is not limited to:
        <ul>
            <li>Aggregate Extraction</li>
            <li>Placer Mining</li>
            <li>Peat Extraction</li>
            <li>Soil Removal</li>
        </ul>
        <br />
        Fill includes but is not limited to:
        <ul>
            <li>Aggregate</li>
            <li>Topsoil</li>
            <li>Structural Fill</li>
            <li>Sand</li>
            <li>Gravel</li>
        </ul>   
      ', 'Removal of Soil (Extraction) and Placement of Fill within the ALR'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Removal of Soil', 'ROSO', 'Removal of Soil Only', 'SOIL', 'Choose this option if you are only proposing to remove soil from ALR land under
        <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section20.3">Section 20.3(1)(c) of the Agricultural Land Commission Act.</a>
        <br /><br />
        Soil includes but is not limited to:
        <ul>
            <li>Aggregate Extraction</li>
            <li>Placer Mining</li>
            <li>Peat Extraction</li>
            <li>Soil Removal</li>
        </ul>
      ', 'Removal of Soil (Extraction) within the ALR');
    `);

    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "type_code" text NOT NULL DEFAULT 'POFO'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ALTER COLUMN "type_code" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP CONSTRAINT "FK_d3247037b5d69365c94a6e5ddc9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ALTER COLUMN "local_government_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ALTER COLUMN "region_code" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."local_government" ADD CONSTRAINT "FK_b1d9c7304c6cde02bc651fbd954" FOREIGN KEY ("preferred_region_code") REFERENCES "alcs"."application_region"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD CONSTRAINT "FK_58853fcb8957e8b2c131cc12da1" FOREIGN KEY ("local_government_uuid") REFERENCES "alcs"."local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."covenant" ADD CONSTRAINT "FK_0fa742d800bc0e0b3f2451e0f0b" FOREIGN KEY ("local_government_uuid") REFERENCES "alcs"."local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD CONSTRAINT "FK_7e78db4d1c5afb16374253b42d4" FOREIGN KEY ("local_government_uuid") REFERENCES "alcs"."local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD CONSTRAINT "FK_d3247037b5d69365c94a6e5ddc9" FOREIGN KEY ("region_code") REFERENCES "alcs"."application_region"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD CONSTRAINT "FK_7b4b618e6aaf6c0205d36a5e2ca" FOREIGN KEY ("type_code") REFERENCES "alcs"."notice_of_intent_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD CONSTRAINT "FK_5a57c8d407eb6132ed39cb8fe6f" FOREIGN KEY ("local_government_uuid") REFERENCES "alcs"."local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD CONSTRAINT "FK_ad65e20b0787e13906e0f36f1cf" FOREIGN KEY ("created_by_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD CONSTRAINT "FK_07e0aa0c43cb5a2bfc2c00282d4" FOREIGN KEY ("file_number") REFERENCES "alcs"."notice_of_intent"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP CONSTRAINT "FK_07e0aa0c43cb5a2bfc2c00282d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP CONSTRAINT "FK_ad65e20b0787e13906e0f36f1cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP CONSTRAINT "FK_5a57c8d407eb6132ed39cb8fe6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP CONSTRAINT "FK_7b4b618e6aaf6c0205d36a5e2ca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP CONSTRAINT "FK_d3247037b5d69365c94a6e5ddc9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP CONSTRAINT "FK_7e78db4d1c5afb16374253b42d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."covenant" DROP CONSTRAINT "FK_0fa742d800bc0e0b3f2451e0f0b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP CONSTRAINT "FK_58853fcb8957e8b2c131cc12da1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."local_government" DROP CONSTRAINT "FK_b1d9c7304c6cde02bc651fbd954"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ALTER COLUMN "region_code" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ALTER COLUMN "local_government_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD CONSTRAINT "FK_d3247037b5d69365c94a6e5ddc9" FOREIGN KEY ("region_code") REFERENCES "alcs"."application_region"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "type_code"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."notice_of_intent_submission"`);
    await queryRunner.query(`DROP TABLE "alcs"."notice_of_intent_type"`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."local_government" RENAME TO "application_local_government"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD CONSTRAINT "FK_5a57c8d407eb6132ed39cb8fe6f" FOREIGN KEY ("local_government_uuid") REFERENCES "alcs"."application_local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD CONSTRAINT "FK_7e78db4d1c5afb16374253b42d4" FOREIGN KEY ("local_government_uuid") REFERENCES "alcs"."application_local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."covenant" ADD CONSTRAINT "FK_0fa742d800bc0e0b3f2451e0f0b" FOREIGN KEY ("local_government_uuid") REFERENCES "alcs"."application_local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD CONSTRAINT "FK_58853fcb8957e8b2c131cc12da1" FOREIGN KEY ("local_government_uuid") REFERENCES "alcs"."application_local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
