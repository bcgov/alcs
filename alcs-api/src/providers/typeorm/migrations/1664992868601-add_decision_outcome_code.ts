import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDecisionOutcomeCode1664992868601 implements MigrationInterface {
  name = 'addDecisionOutcomeCode1664992868601';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "application_decision_outcome" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_d00682751a3d4cdd7c9a16ab041" UNIQUE ("code"), CONSTRAINT "UQ_77e04acc3bb3e8b5226c481c039" UNIQUE ("description"), CONSTRAINT "PK_cd7126f6177b068f58e05d47b8f" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP COLUMN "outcome"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD "outcome_uuid" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "FK_cd7126f6177b068f58e05d47b8f" FOREIGN KEY ("outcome_uuid") REFERENCES "application_decision_outcome"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`INSERT INTO "public"."application_decision_outcome"
        ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "code", "description", "label") VALUES
        ('eacb28af-d2ab-45e9-8595-7381a8e6d6d4', NULL, NOW(), NULL, 'alcs-api', NULL, 'APPR', 'Decision was Approved', 'Approved'),
        ('e79eeb21-1731-435b-b15a-bd2f8f1cf08d', NULL, NOW(), NULL, 'alcs-api', NULL, 'APPA', 'Decision was Approved Alternated', 'Approved Alternate'),
        ('e16ace2b-fee1-4bf9-a71b-900971d3c014', NULL, NOW(), NULL, 'alcs-api', NULL, 'REFU', 'Decision was Refused', 'Refused');
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "FK_cd7126f6177b068f58e05d47b8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP COLUMN "outcome_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD "outcome" text NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "application_decision_outcome"`);
  }
}
