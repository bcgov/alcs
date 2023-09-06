import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNotificationDocuments1694037493007
  implements MigrationInterface
{
  name = 'addNotificationDocuments1694037493007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."notification_document" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "type_code" text, "description" text, "notification_uuid" uuid NOT NULL, "document_uuid" uuid, "visibility_flags" text array NOT NULL DEFAULT '{}', "audit_created_by" text, CONSTRAINT "REL_754c65b2ab78e39c64c31f2f9f" UNIQUE ("document_uuid"), CONSTRAINT "PK_cb4155e1f9d5b5ebd27c8de6381" PRIMARY KEY ("uuid")); COMMENT ON COLUMN "alcs"."notification_document"."audit_created_by" IS 'used only for oats etl process'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" ADD CONSTRAINT "FK_dc6a7789a73ec2e0eac2b2307d3" FOREIGN KEY ("type_code") REFERENCES "alcs"."document_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" ADD CONSTRAINT "FK_fdb3697b2dfc6ee1e72e85b01e2" FOREIGN KEY ("notification_uuid") REFERENCES "alcs"."notification"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" ADD CONSTRAINT "FK_754c65b2ab78e39c64c31f2f9f9" FOREIGN KEY ("document_uuid") REFERENCES "alcs"."document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" DROP CONSTRAINT "FK_754c65b2ab78e39c64c31f2f9f9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" DROP CONSTRAINT "FK_fdb3697b2dfc6ee1e72e85b01e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" DROP CONSTRAINT "FK_dc6a7789a73ec2e0eac2b2307d3"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."notification_document"`);
  }
}
