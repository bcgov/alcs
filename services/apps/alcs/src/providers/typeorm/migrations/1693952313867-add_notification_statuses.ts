import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNotificationStatuses1693952313867
  implements MigrationInterface
{
  name = 'addNotificationStatuses1693952313867';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."notification_submission_status_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, "weight" smallint NOT NULL DEFAULT '0', "alcs_background_color" character varying NOT NULL, "alcs_color" character varying NOT NULL, "portal_background_color" character varying NOT NULL, "portal_color" character varying NOT NULL, CONSTRAINT "UQ_7fb8eeb106bb4bb0b0738bd1106" UNIQUE ("description"), CONSTRAINT "PK_9a28eacfd5a7b00f06bdf234bcd" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notification_submission_to_submission_status" ("effective_date" TIMESTAMP WITH TIME ZONE, "submission_uuid" uuid NOT NULL, "status_type_code" text NOT NULL, CONSTRAINT "PK_913960c8fe5b20339701b6be841" PRIMARY KEY ("submission_uuid", "status_type_code"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission_to_submission_status" ADD CONSTRAINT "FK_279dfb38cef709b730605d296a1" FOREIGN KEY ("submission_uuid") REFERENCES "alcs"."notification_submission"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission_to_submission_status" ADD CONSTRAINT "FK_a38303f5bfdee8a260a48320b24" FOREIGN KEY ("status_type_code") REFERENCES "alcs"."notification_submission_status_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission_to_submission_status" DROP CONSTRAINT "FK_a38303f5bfdee8a260a48320b24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission_to_submission_status" DROP CONSTRAINT "FK_279dfb38cef709b730605d296a1"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."notification_submission_to_submission_status"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."notification_submission_status_type"`,
    );
  }
}
