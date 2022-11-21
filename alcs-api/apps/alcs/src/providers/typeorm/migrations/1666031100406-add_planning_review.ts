import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPlanningReview1666031100406 implements MigrationInterface {
  name = 'addPlanningReview1666031100406';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "planning_review" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "file_number" character varying NOT NULL, "type" character varying NOT NULL, "card_uuid" uuid NOT NULL, "local_government_uuid" uuid NOT NULL, "region_uuid" uuid NOT NULL, CONSTRAINT "UQ_18da9d3909cdf5217166c23246f" UNIQUE ("file_number"), CONSTRAINT "REL_03a05aa8fefbc2fc1cdf138d80" UNIQUE ("card_uuid"), CONSTRAINT "PK_8831458aaa7f36b0672d238c032" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" ADD CONSTRAINT "FK_03a05aa8fefbc2fc1cdf138d807" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" ADD CONSTRAINT "FK_aa000ca980238643bb70df5270b" FOREIGN KEY ("local_government_uuid") REFERENCES "application_local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" ADD CONSTRAINT "FK_3afd8e13199baffc02bd7b0ccba" FOREIGN KEY ("region_uuid") REFERENCES "application_region"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `
      INSERT INTO public.card_type (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"label",code,description) VALUES
	    ('1f6e81ee-d7f1-447b-9531-12b200e18d05',NULL,'2022-10-17 13:52:12.366',NULL,'migration_seed',NULL,'Planning Review','PLAN','Card type for Executive Committee planning reviews');
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
          DELETE FROM public.card_type WHERE code = 'PLAN';
      `,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" DROP CONSTRAINT "FK_3afd8e13199baffc02bd7b0ccba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" DROP CONSTRAINT "FK_aa000ca980238643bb70df5270b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" DROP CONSTRAINT "FK_03a05aa8fefbc2fc1cdf138d807"`,
    );
    await queryRunner.query(`DROP TABLE "planning_review"`);
  }
}
