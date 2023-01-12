import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAppReview1673394459509 implements MigrationInterface {
  name = 'addAppReview1673394459509';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "portal"."application_review" (
        "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE,
        "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "audit_created_by" character varying NOT NULL,
        "audit_updated_by" character varying,
        "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
        "local_government_file_number" text,
        "first_name" text,
        "last_name" text,
        "position" text,
        "department" text,
        "phone_number" text,
        "email" text,
        "is_ocp_designation" boolean,
        "ocp_bylaw_name" text,
        "ocp_designation" text,
        "ocp_consistent" boolean,
        "is_subject_to_zoning" boolean,
        "zoning_bylaw_name" text,
        "zoning_designation" text,
        "zoning_minimum_lot_size" text,
        "is_zoning_consistent" boolean,
        "is_authorized" boolean,
        "application_file_number" character varying NOT NULL,
        CONSTRAINT "REL_325a8bf11bfc0f46f45069c3d1" UNIQUE ("application_file_number"),
        CONSTRAINT "PK_de0fa98ceff467f34dd766006bf" PRIMARY KEY ("uuid"));`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_review" ADD CONSTRAINT "FK_325a8bf11bfc0f46f45069c3d1e" FOREIGN KEY ("application_file_number") REFERENCES "portal"."application"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_review" DROP CONSTRAINT "FK_325a8bf11bfc0f46f45069c3d1e"`,
    );
    await queryRunner.query(`DROP TABLE "portal"."application_review"`);
  }
}
