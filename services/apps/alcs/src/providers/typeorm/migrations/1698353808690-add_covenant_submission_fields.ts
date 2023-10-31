import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCovenantSubmissionFields1698353808690
  implements MigrationInterface
{
  name = 'addCovenantSubmissionFields1698353808690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."covenant_transferee" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "first_name" character varying, "last_name" character varying, "organization_name" character varying, "phone_number" character varying, "email" character varying, "application_submission_uuid" uuid NOT NULL, "type_code" text NOT NULL, CONSTRAINT "PK_cae224f147ca2f991458001a996" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "cove_area_impacted" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "cove_has_draft" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "cove_farm_impact" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."covenant_transferee" ADD CONSTRAINT "FK_b0b99b320c30dd49a15f43fd515" FOREIGN KEY ("type_code") REFERENCES "alcs"."owner_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."covenant_transferee" ADD CONSTRAINT "FK_a1c022ef4e1785b2877cb6aab69" FOREIGN KEY ("application_submission_uuid") REFERENCES "alcs"."application_submission"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."covenant_transferee" IS 'Stores Transferees for Restrictive Covenant Applications'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."covenant_transferee" DROP CONSTRAINT "FK_a1c022ef4e1785b2877cb6aab69"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."covenant_transferee" DROP CONSTRAINT "FK_b0b99b320c30dd49a15f43fd515"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "cove_farm_impact"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "cove_has_draft"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "cove_area_impacted"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."covenant_transferee"`);
  }
}
