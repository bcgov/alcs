import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEmailTracking1680801799010 implements MigrationInterface {
  name = 'addEmailTracking1680801799010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."email_status" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "sent_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "transaction_id" character varying, "recipients" character varying NOT NULL, "status" character varying NOT NULL, "errors" text, CONSTRAINT "PK_ae9796cd54d360425083adb9777" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."email_status"."transaction_id" IS 'Transaction ID returned by CHES'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "alcs"."email_status"`);
  }
}
