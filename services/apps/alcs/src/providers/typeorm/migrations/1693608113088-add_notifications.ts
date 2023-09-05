import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNotifications1693608113088 implements MigrationInterface {
  name = 'addNotifications1693608113088';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER INDEX "alcs"."PK_b9fa421f94f7707ba109bf73b82" RENAME TO "PK_b9fa421f94fba109bf73b82";
    `);
    await queryRunner.query(
      `ALTER TABLE "alcs"."message" DROP CONSTRAINT "FK_fc0e9a26b0a8f7c76658ca1c6ca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."message" DROP CONSTRAINT "FK_b776eec36c2a6b6879c14241e91"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP CONSTRAINT "FK_33f7b06b2c4e0e128d670526c66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" DROP CONSTRAINT "FK_7b23cfdc8574f66dd2f88e37f3f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel_ownership_type" RENAME TO "parcel_ownership_type"`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notification_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, "short_label" character varying NOT NULL, "html_description" text NOT NULL DEFAULT '', "portal_label" text NOT NULL DEFAULT '', CONSTRAINT "UQ_4c3787562f347d8d0ff63aa1a58" UNIQUE ("description"), CONSTRAINT "PK_585e07520c840e791dcfb7da013" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notification" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "file_number" character varying NOT NULL, "applicant" character varying NOT NULL, "card_uuid" uuid, "local_government_uuid" uuid, "region_code" text, "summary" text, "date_submitted_to_alc" TIMESTAMP WITH TIME ZONE, "staff_observations" text, "type_code" text NOT NULL, CONSTRAINT "UQ_2b146911206953684d622397340" UNIQUE ("file_number"), CONSTRAINT "REL_ea8f1884038f559b573689d8de" UNIQUE ("card_uuid"), CONSTRAINT "PK_b9fa421f94f7707ba109bf73b82" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."notification"."staff_observations" IS 'ALC Staff Observations and Comments'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2b146911206953684d62239734" ON "alcs"."notification" ("file_number") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8a9fed11ce76672d806ac8b4b6" ON "alcs"."notification" ("local_government_uuid") `,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notification_parcel" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "pid" character varying, "pin" character varying, "legal_description" character varying, "civic_address" character varying, "map_area_hectares" double precision, "is_confirmed_by_applicant" boolean NOT NULL DEFAULT false, "ownership_type_code" text, "notification_submission_uuid" uuid NOT NULL, CONSTRAINT "PK_0f33b7df283efdcfdb0ceceb11b" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."notification_parcel"."pid" IS 'The Parcels pid entered by the user or populated from third-party data'; COMMENT ON COLUMN "alcs"."notification_parcel"."pin" IS 'The Parcels pin entered by the user or populated from third-party data'; COMMENT ON COLUMN "alcs"."notification_parcel"."legal_description" IS 'The Parcels legalDescription entered by the user or populated from third-party data'; COMMENT ON COLUMN "alcs"."notification_parcel"."civic_address" IS 'The standard address for the parcel'; COMMENT ON COLUMN "alcs"."notification_parcel"."map_area_hectares" IS 'The Parcels map are in hectares entered by the user or populated from third-party data'; COMMENT ON COLUMN "alcs"."notification_parcel"."is_confirmed_by_applicant" IS 'The Parcels indication whether applicant signed off provided data including the Certificate of Title'`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notification_transferee" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "first_name" character varying, "last_name" character varying, "organization_name" character varying, "phone_number" character varying, "email" character varying, "notification_submission_uuid" uuid NOT NULL, "type_code" text NOT NULL, CONSTRAINT "PK_77e372de24341033c6f1242135d" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notification_submission" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "file_number" character varying NOT NULL, "applicant" character varying, "local_government_uuid" uuid, "purpose" character varying, "type_code" character varying NOT NULL, "created_by_uuid" uuid, CONSTRAINT "PK_31d1568857de3aeec7cf5c8ad34" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."notification_submission"."file_number" IS 'File Number of attached SRW'; COMMENT ON COLUMN "alcs"."notification_submission"."applicant" IS 'The Applicants name on the application'; COMMENT ON COLUMN "alcs"."notification_submission"."local_government_uuid" IS 'UUID of the Local Government'; COMMENT ON COLUMN "alcs"."notification_submission"."purpose" IS 'The purpose of the application'; COMMENT ON COLUMN "alcs"."notification_submission"."type_code" IS 'SRW Type Code'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."message" ADD CONSTRAINT "FK_f9d295dbeac38c6b05f0994b415" FOREIGN KEY ("actor_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."message" ADD CONSTRAINT "FK_23212dcb31290e8972bd4e8aa4d" FOREIGN KEY ("receiver_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification" ADD CONSTRAINT "FK_ea8f1884038f559b573689d8de2" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification" ADD CONSTRAINT "FK_8a9fed11ce76672d806ac8b4b6f" FOREIGN KEY ("local_government_uuid") REFERENCES "alcs"."local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification" ADD CONSTRAINT "FK_569fdffb2b9c20c938390abf6a3" FOREIGN KEY ("region_code") REFERENCES "alcs"."application_region"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification" ADD CONSTRAINT "FK_585e07520c840e791dcfb7da013" FOREIGN KEY ("type_code") REFERENCES "alcs"."notification_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD CONSTRAINT "FK_33f7b06b2c4e0e128d670526c66" FOREIGN KEY ("ownership_type_code") REFERENCES "alcs"."parcel_ownership_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" ADD CONSTRAINT "FK_7b23cfdc8574f66dd2f88e37f3f" FOREIGN KEY ("ownership_type_code") REFERENCES "alcs"."parcel_ownership_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_parcel" ADD CONSTRAINT "FK_ee3c1a069b76e3877ad5fbfa80e" FOREIGN KEY ("ownership_type_code") REFERENCES "alcs"."parcel_ownership_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_parcel" ADD CONSTRAINT "FK_3286388e9f39a4342f302d8ebc4" FOREIGN KEY ("notification_submission_uuid") REFERENCES "alcs"."notification_submission"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_transferee" ADD CONSTRAINT "FK_b7a59b609714919f65604e2ad96" FOREIGN KEY ("type_code") REFERENCES "alcs"."owner_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_transferee" ADD CONSTRAINT "FK_300863f6b4601735373ea3f6142" FOREIGN KEY ("notification_submission_uuid") REFERENCES "alcs"."notification_submission"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" ADD CONSTRAINT "FK_99aed25adf97bc0591103e246c2" FOREIGN KEY ("created_by_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" ADD CONSTRAINT "FK_5ef174c63d20561082cda20da3b" FOREIGN KEY ("file_number") REFERENCES "alcs"."notification"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" DROP CONSTRAINT "FK_5ef174c63d20561082cda20da3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" DROP CONSTRAINT "FK_99aed25adf97bc0591103e246c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_transferee" DROP CONSTRAINT "FK_300863f6b4601735373ea3f6142"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_transferee" DROP CONSTRAINT "FK_b7a59b609714919f65604e2ad96"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_parcel" DROP CONSTRAINT "FK_3286388e9f39a4342f302d8ebc4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_parcel" DROP CONSTRAINT "FK_ee3c1a069b76e3877ad5fbfa80e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" DROP CONSTRAINT "FK_7b23cfdc8574f66dd2f88e37f3f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP CONSTRAINT "FK_33f7b06b2c4e0e128d670526c66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification" DROP CONSTRAINT "FK_585e07520c840e791dcfb7da013"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification" DROP CONSTRAINT "FK_569fdffb2b9c20c938390abf6a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification" DROP CONSTRAINT "FK_8a9fed11ce76672d806ac8b4b6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification" DROP CONSTRAINT "FK_ea8f1884038f559b573689d8de2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP CONSTRAINT "FK_d4a78fa6d709aace10890017271"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."message" DROP CONSTRAINT "FK_23212dcb31290e8972bd4e8aa4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."message" DROP CONSTRAINT "FK_f9d295dbeac38c6b05f0994b415"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ALTER COLUMN "outcome_code" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD CONSTRAINT "FK_d4a78fa6d709aace10890017271" FOREIGN KEY ("outcome_code") REFERENCES "alcs"."notice_of_intent_decision_outcome"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."notification_submission"`);
    await queryRunner.query(`DROP TABLE "alcs"."notification_transferee"`);
    await queryRunner.query(`DROP TABLE "alcs"."notification_parcel"`);

    await queryRunner.query(
      `ALTER TABLE "alcs"."parcel_ownership_type" RENAME TO "application_parcel_ownership_type"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_8a9fed11ce76672d806ac8b4b6"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_2b146911206953684d62239734"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."notification"`);
    await queryRunner.query(`DROP TABLE "alcs"."notification_type"`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" ADD CONSTRAINT "FK_7b23cfdc8574f66dd2f88e37f3f" FOREIGN KEY ("ownership_type_code") REFERENCES "alcs"."notice_of_intent_parcel_ownership_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD CONSTRAINT "FK_33f7b06b2c4e0e128d670526c66" FOREIGN KEY ("ownership_type_code") REFERENCES "alcs"."application_parcel_ownership_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."message" ADD CONSTRAINT "FK_b776eec36c2a6b6879c14241e91" FOREIGN KEY ("receiver_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."message" ADD CONSTRAINT "FK_fc0e9a26b0a8f7c76658ca1c6ca" FOREIGN KEY ("actor_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
