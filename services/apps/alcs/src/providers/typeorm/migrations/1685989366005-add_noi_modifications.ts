import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoiModifications1685989366005 implements MigrationInterface {
  name = 'addNoiModifications1685989366005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_modification_outcome_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_1d338cdf58949f08bf30971d235" UNIQUE ("description"), CONSTRAINT "PK_6f84b5af24850cbff5ec1dff0a8" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_modification" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "submitted_date" TIMESTAMP WITH TIME ZONE NOT NULL, "review_outcome_code" text NOT NULL DEFAULT 'PEN', "review_date" TIMESTAMP WITH TIME ZONE, "notice_of_intent_uuid" uuid NOT NULL, "card_uuid" uuid NOT NULL, CONSTRAINT "REL_bf0ebc2212d34996113c9de228" UNIQUE ("card_uuid"), CONSTRAINT "PK_f754a9aa5bf39c23a4a840c349b" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD "modifies_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD CONSTRAINT "UQ_aa4bdcb54aeaecc7e357e2c80fc" UNIQUE ("modifies_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" ADD CONSTRAINT "FK_3075ffd393f424e599c0a59ab61" FOREIGN KEY ("review_outcome_code") REFERENCES "alcs"."notice_of_intent_modification_outcome_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" ADD CONSTRAINT "FK_0369285c23e89b516a317fb986d" FOREIGN KEY ("notice_of_intent_uuid") REFERENCES "alcs"."notice_of_intent"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" ADD CONSTRAINT "FK_bf0ebc2212d34996113c9de2284" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD CONSTRAINT "FK_aa4bdcb54aeaecc7e357e2c80fc" FOREIGN KEY ("modifies_uuid") REFERENCES "alcs"."notice_of_intent_modification"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP CONSTRAINT "FK_aa4bdcb54aeaecc7e357e2c80fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" DROP CONSTRAINT "FK_bf0ebc2212d34996113c9de2284"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" DROP CONSTRAINT "FK_0369285c23e89b516a317fb986d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" DROP CONSTRAINT "FK_3075ffd393f424e599c0a59ab61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP CONSTRAINT "UQ_aa4bdcb54aeaecc7e357e2c80fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "modifies_uuid"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_modification"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_modification_outcome_type"`,
    );
  }
}
