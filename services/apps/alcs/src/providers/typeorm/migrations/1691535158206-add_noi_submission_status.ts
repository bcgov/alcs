import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoiSubmissionStatus1691535158206 implements MigrationInterface {
  name = 'addNoiSubmissionStatus1691535158206';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_submission_status_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, "weight" smallint NOT NULL DEFAULT '0', "alcs_background_color" character varying NOT NULL, "alcs_color" character varying NOT NULL, "portal_background_color" character varying NOT NULL, "portal_color" character varying NOT NULL, CONSTRAINT "UQ_3912cacd6f3254d0e91c3233e67" UNIQUE ("description"), CONSTRAINT "PK_bd145e6e0aa2eedbeb532f6e69b" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_submission_to_submission_status" ("effective_date" TIMESTAMP WITH TIME ZONE, "submission_uuid" uuid NOT NULL, "status_type_code" text NOT NULL, CONSTRAINT "PK_4aa66d524d633c477ae70e3db6f" PRIMARY KEY ("submission_uuid", "status_type_code"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission_to_submission_status" ADD CONSTRAINT "FK_99fd3c0652099227d1ad64b44cf" FOREIGN KEY ("submission_uuid") REFERENCES "alcs"."notice_of_intent_submission"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission_to_submission_status" ADD CONSTRAINT "FK_d3f0150fc7dcc611898705ad81d" FOREIGN KEY ("status_type_code") REFERENCES "alcs"."notice_of_intent_submission_status_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission_to_submission_status" DROP CONSTRAINT "FK_d3f0150fc7dcc611898705ad81d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission_to_submission_status" DROP CONSTRAINT "FK_99fd3c0652099227d1ad64b44cf"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_submission_to_submission_status"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_submission_status_type"`,
    );
  }
}
