import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrations1689008759210 implements MigrationInterface {
  name = 'migrations1689008759210';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_submission_status_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, "weight" smallint NOT NULL DEFAULT '0', CONSTRAINT "UQ_1ebbf489a03b1c0fbe54f8ac7e2" UNIQUE ("description"), CONSTRAINT "PK_e53c2c08546baf4d6b5b2326c3d" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_submission_to_submission_status" ("effective_date" TIMESTAMP WITH TIME ZONE, "submission_uuid" uuid NOT NULL, "status_type_code" text NOT NULL, CONSTRAINT "PK_2aedecbaaf7b78b680dd5860c6b" PRIMARY KEY ("submission_uuid", "status_type_code"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_to_submission_status" ADD CONSTRAINT "FK_9b9f3f74a8502b01bbf93bd7b77" FOREIGN KEY ("submission_uuid") REFERENCES "alcs"."application_submission"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_to_submission_status" ADD CONSTRAINT "FK_cc4b3297a2927c718987ec1a930" FOREIGN KEY ("status_type_code") REFERENCES "alcs"."application_submission_status_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_to_submission_status" DROP CONSTRAINT "FK_cc4b3297a2927c718987ec1a930"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_to_submission_status" DROP CONSTRAINT "FK_9b9f3f74a8502b01bbf93bd7b77"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_submission_to_submission_status"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_submission_status_type"`,
    );
  }
}
