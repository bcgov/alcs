import { MigrationInterface, QueryRunner } from 'typeorm';

export class applicationMeeting1661797578901 implements MigrationInterface {
  name = 'applicationMeeting1661797578901';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "application_meeting_type" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_85b30b748ea5fd08763e0ecf628" UNIQUE ("code"), CONSTRAINT "UQ_d1e025597c97f817a546a3877c9" UNIQUE ("description"), CONSTRAINT "PK_72a475306937f870cdffdcc0981" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "application_meeting" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "type_uuid" uuid NOT NULL, "application_uuid" uuid NOT NULL, CONSTRAINT "PK_cd00f1709cc87faf611c3e4c284" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision_meeting" ALTER COLUMN "date" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD CONSTRAINT "FK_72a475306937f870cdffdcc0981" FOREIGN KEY ("type_uuid") REFERENCES "application_meeting_type"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD CONSTRAINT "FK_4a7e09569765e147304194b63f5" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP CONSTRAINT "FK_4a7e09569765e147304194b63f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP CONSTRAINT "FK_72a475306937f870cdffdcc0981"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision_meeting" ALTER COLUMN "date" SET DEFAULT now()`,
    );
    await queryRunner.query(`DROP TABLE "application_meeting"`);
    await queryRunner.query(`DROP TABLE "application_meeting_type"`);
  }
}
