import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoi1685039734407 implements MigrationInterface {
  name = 'addNoi1685039734407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "file_number" character varying NOT NULL, "applicant" character varying NOT NULL, "card_uuid" uuid NOT NULL, "local_government_uuid" uuid NOT NULL, "region_code" text NOT NULL, CONSTRAINT "UQ_66754bb64e9b1625c98b9cc0f67" UNIQUE ("file_number"), CONSTRAINT "REL_2f863dc7ab4f76a87b160f3288" UNIQUE ("card_uuid"), CONSTRAINT "PK_fc320533e3f23a9fd957845334d" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD CONSTRAINT "FK_2f863dc7ab4f76a87b160f32881" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD CONSTRAINT "FK_7e78db4d1c5afb16374253b42d4" FOREIGN KEY ("local_government_uuid") REFERENCES "alcs"."application_local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD CONSTRAINT "FK_d3247037b5d69365c94a6e5ddc9" FOREIGN KEY ("region_code") REFERENCES "alcs"."application_region"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP CONSTRAINT "FK_d3247037b5d69365c94a6e5ddc9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP CONSTRAINT "FK_7e78db4d1c5afb16374253b42d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP CONSTRAINT "FK_2f863dc7ab4f76a87b160f32881"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."notice_of_intent"`);
  }
}
