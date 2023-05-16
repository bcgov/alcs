import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDecConditions1684167350589 implements MigrationInterface {
  name = 'addDecConditions1684167350589';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_decision_condition_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_a91ddcd55733c944606d56a7767" UNIQUE ("description"), CONSTRAINT "PK_14b7fff6b85bf51b9ab527e64f6" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_decision_condition" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "approval_dependant" boolean, "security_amount" numeric(12,2), "administrative_fee" numeric(12,2), "description" text, "decision_uuid" uuid NOT NULL, "code_code" text, CONSTRAINT "PK_992b9bc08f066f248b0c25cbcc0" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" DROP COLUMN "type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" ADD CONSTRAINT "FK_d8795b5dbf575cf5996647d9afe" FOREIGN KEY ("code_code") REFERENCES "alcs"."application_decision_condition_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" ADD CONSTRAINT "FK_fdf2b431fe834beeb5c59ef4c67" FOREIGN KEY ("decision_uuid") REFERENCES "alcs"."application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" DROP CONSTRAINT "FK_fdf2b431fe834beeb5c59ef4c67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" DROP CONSTRAINT "FK_d8795b5dbf575cf5996647d9afe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ADD "type" character varying`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_decision_condition"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_decision_condition_type"`,
    );
  }
}
