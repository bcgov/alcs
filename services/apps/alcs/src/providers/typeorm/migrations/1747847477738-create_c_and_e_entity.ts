import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCAndEEntity1747847477738 implements MigrationInterface {
  name = 'CreateCAndEEntity1747847477738';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "alcs"."compliance_and_enforcement_initial_submission_type_enum" AS ENUM('Complaint', 'Referral')`,
    );
    await queryRunner.query(
      `CREATE TYPE "alcs"."compliance_and_enforcement_alleged_activity_enum" AS ENUM('Breach of Condition', 'Extraction', 'Fill', 'Non-Farm Use', 'Other', 'Residence')`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."compliance_and_enforcement" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "file_number" character varying NOT NULL DEFAULT NEXTVAL('alcs.alcs_file_number_seq'), "date_submitted" TIMESTAMP WITH TIME ZONE, "date_opened" TIMESTAMP WITH TIME ZONE, "date_closed" TIMESTAMP WITH TIME ZONE, "initial_submission_type" "alcs"."compliance_and_enforcement_initial_submission_type_enum", "alleged_contravention_narrative" text NOT NULL DEFAULT '', "alleged_activity" "alcs"."compliance_and_enforcement_alleged_activity_enum" array NOT NULL DEFAULT '{}', "intake_notes" text NOT NULL DEFAULT '', CONSTRAINT "UQ_1ec3378cb5c34a48af1426840e7" UNIQUE ("file_number"), CONSTRAINT "PK_f4122d7d87ff1aafd2de22c3bd4" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."compliance_and_enforcement" IS 'Compliance and enforcement file'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement" IS NULL`);
    await queryRunner.query(`DROP TABLE "alcs"."compliance_and_enforcement"`);
    await queryRunner.query(`DROP TYPE "alcs"."compliance_and_enforcement_alleged_activity_enum"`);
    await queryRunner.query(`DROP TYPE "alcs"."compliance_and_enforcement_initial_submission_type_enum"`);
  }
}
