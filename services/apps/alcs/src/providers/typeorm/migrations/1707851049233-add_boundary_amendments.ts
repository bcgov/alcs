import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBoundaryAmendments1707851049233 implements MigrationInterface {
  name = 'AddBoundaryAmendments1707851049233';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_boundary_amendment" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "file_number" character varying NOT NULL, "type" character varying NOT NULL, "area" numeric(15,5), "year" integer, "period" smallint, CONSTRAINT "PK_dd163805033c64ed3fa474ada55" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."application_boundary_amendment"."file_number" IS 'File number of the application'; COMMENT ON COLUMN "alcs"."application_boundary_amendment"."type" IS 'Type of Amendment, Inclusion or Exclusion'; COMMENT ON COLUMN "alcs"."application_boundary_amendment"."area" IS 'Area in hectares of the amendment'; COMMENT ON COLUMN "alcs"."application_boundary_amendment"."year" IS 'Year the amendment took place'; COMMENT ON COLUMN "alcs"."application_boundary_amendment"."period" IS 'Period of the year the amendment took place (1 - 4)'`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_boundary_amendments_to_components" ("application_boundary_amendment_uuid" uuid NOT NULL, "application_decision_component_uuid" uuid NOT NULL, CONSTRAINT "PK_6d70986025e4884d3c6953a291e" PRIMARY KEY ("application_boundary_amendment_uuid", "application_decision_component_uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_01e2407bb30f4f6d7e5b26244a" ON "alcs"."application_boundary_amendments_to_components" ("application_boundary_amendment_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_991ebae155fdffa94befd0c20a" ON "alcs"."application_boundary_amendments_to_components" ("application_decision_component_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_boundary_amendments_to_components" ADD CONSTRAINT "FK_01e2407bb30f4f6d7e5b26244a0" FOREIGN KEY ("application_boundary_amendment_uuid") REFERENCES "alcs"."application_boundary_amendment"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_boundary_amendments_to_components" ADD CONSTRAINT "FK_991ebae155fdffa94befd0c20a1" FOREIGN KEY ("application_decision_component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_boundary_amendment" IS 'Used by ALC GIS Staff to track Inclusion / Exclusion decisions and their ALR boundary impact over time';`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."application_boundary_amendments_to_components" IS 'Links Boundary Amendments to the Decision Components they result from';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_boundary_amendments_to_components" DROP CONSTRAINT "FK_991ebae155fdffa94befd0c20a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_boundary_amendments_to_components" DROP CONSTRAINT "FK_01e2407bb30f4f6d7e5b26244a0"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_991ebae155fdffa94befd0c20a"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_01e2407bb30f4f6d7e5b26244a"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_boundary_amendments_to_components"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_boundary_amendment"`,
    );
  }
}
