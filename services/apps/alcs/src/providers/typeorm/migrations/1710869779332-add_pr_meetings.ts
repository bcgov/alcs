import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrMeetings1710869779332 implements MigrationInterface {
  name = 'AddPrMeetings1710869779332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."planning_review_meeting_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_192f56174d61ea85f55f7c94d1b" UNIQUE ("description"), CONSTRAINT "PK_3cb364ba2e88e35a13fdb9cdbd0" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."planning_review_meeting_type" IS 'Meetings Types for Planning Review Meetings'`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."planning_review_meeting" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "type_code" text NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "planning_review_uuid" uuid NOT NULL, CONSTRAINT "PK_7c2ce6697f1c82b92d303d95ecd" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."planning_review_meeting"."date" IS 'Date of the meeting'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."planning_review_meeting" IS 'Meeting schedule for Planning Reviews'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_meeting" ADD CONSTRAINT "FK_3cb364ba2e88e35a13fdb9cdbd0" FOREIGN KEY ("type_code") REFERENCES "alcs"."planning_review_meeting_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_meeting" ADD CONSTRAINT "FK_9ffabcba2f2b7059bbb49ecb5e5" FOREIGN KEY ("planning_review_uuid") REFERENCES "alcs"."planning_review"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_meeting" DROP CONSTRAINT "FK_9ffabcba2f2b7059bbb49ecb5e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_meeting" DROP CONSTRAINT "FK_3cb364ba2e88e35a13fdb9cdbd0"`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."planning_review_meeting" IS NULL`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."planning_review_meeting"`);
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."planning_review_meeting_type" IS NULL`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."planning_review_meeting_type"`);
  }
}
