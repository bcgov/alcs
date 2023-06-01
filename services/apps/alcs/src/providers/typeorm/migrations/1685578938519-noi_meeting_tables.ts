import { MigrationInterface, QueryRunner } from 'typeorm';

export class noiMeetingTables1685578938519 implements MigrationInterface {
  name = 'noiMeetingTables1685578938519';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_meeting_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_fb54860376ce1275e864408f841" UNIQUE ("description"), CONSTRAINT "PK_a2f4e9e549018b8d3be8173713b" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_meeting" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "description" text, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "end_date" TIMESTAMP WITH TIME ZONE, "type_code" text NOT NULL, "notice_of_intent_uuid" uuid NOT NULL, CONSTRAINT "PK_99f337616a8abb59657ebe870a2" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_meeting" ADD CONSTRAINT "FK_a2f4e9e549018b8d3be8173713b" FOREIGN KEY ("type_code") REFERENCES "alcs"."notice_of_intent_meeting_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_meeting" ADD CONSTRAINT "FK_a848f8d93e3636f77cdf3d67084" FOREIGN KEY ("notice_of_intent_uuid") REFERENCES "alcs"."notice_of_intent"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`
        INSERT INTO "alcs"."notice_of_intent_meeting_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Information Request', 'IR', 'Information Request');
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_meeting" DROP CONSTRAINT "FK_a848f8d93e3636f77cdf3d67084"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_meeting" DROP CONSTRAINT "FK_a2f4e9e549018b8d3be8173713b"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."notice_of_intent_meeting"`);
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_meeting_type"`,
    );
  }
}
