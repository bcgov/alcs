import { MigrationInterface, QueryRunner } from 'typeorm';

export class separateCardFromApplication1663886373621
  implements MigrationInterface
{
  name = 'separateCardFromApplication1663886373621';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE public.application CASCADE;`);
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_fbbc6f68cb51279ecde6d12a890"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" DROP CONSTRAINT "FK_97cd2800c2e17e3cb8c24c78987"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_fe6c9e8b98e3f649b598710dfce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_5b6c6dffed9d8dd24903be05473"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_49d8a9170a71a2e7a9e386c945e"`,
    );
    // TODO: check this
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_fbbc6f68cb51279ecde6d12a89"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" RENAME COLUMN "application_uuid" TO "card_uuid"`,
    );
    await queryRunner.query(
      `CREATE TABLE "card_status" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_3e1a5a0591f4b54698ea641c38d" UNIQUE ("code"), CONSTRAINT "UQ_9743541eb8e42b744016f9d14f9" UNIQUE ("description"), CONSTRAINT "PK_f3fd3dde1c00cd754841b8b696b" PRIMARY KEY ("uuid"))`,
    );

    await queryRunner.query(`INSERT INTO public.card_status (
      uuid, "audit_deleted_date_at", "audit_created_at", "audit_updated_at", audit_created_by, code, label, description) VALUES
      ('e6ddd1af-1cb9-4e45-962a-92e8d532b149',NULL,now(),NULL,'migration_seed', 'INCO', 'Incoming / Prelim Review', 'Application is under preliminary review'),
      ('fac4b88a-9c1a-41f4-885c-408ba6c095ec',NULL,now(),NULL,'migration_seed', 'PREL', 'App Prelim Done/To Be Assigned to LUP', 'Preliminary review complete, ready to be assigned'),
      ('b9fc6416-95c3-40f9-9d32-5e7e3d1231b9',NULL,now(),NULL,'migration_seed', 'PREP', 'Application Prep', 'Preparation is in progress'),
      ('aa5bb0f3-8e50-479c-8c99-105a6d3e2565',NULL,now(),NULL,'migration_seed', 'MEET', 'Site Visit Scheduled / Applicant&nbsp;Meeting', 'Site visit or meeting scheduled with applicant'),
      ('42384f47-d6d1-4b5e-ad9c-a66fc754dd52',NULL,now(),NULL,'migration_seed', 'STAF', 'Staff Report Review', 'Report is ready for review by staff'),
      ('64944bb8-f2f2-4709-9062-214f5c4d3187',NULL,now(),NULL,'migration_seed', 'READ', 'Ready for Review Sent / Going to Next Decision Meeting', 'Report is ready to be reviewed by panel in a meeting'),
      ('5f233a50-97ec-44d3-af56-309f0cdeb29d',NULL,now(),NULL,'migration_seed', 'DRAF', 'Drafting Decision', 'Meeting completed and decision letter is being drafted'),
      ('f784320d-57bb-4021-bdca-203923c34dbe',NULL,now(),NULL,'migration_seed', 'MANA', 'Manager Draft Review', 'Decision letter is drafted and waiting for review'),
      ('1c70dd1f-4373-4999-818e-bffcaaa7f30b',NULL,now(),NULL,'migration_seed', 'PEND', 'Pending Commissioner Sign&#8209;Off', 'Decision letter has completed review and waiting commissioner sign off'),
      ('ddc41949-f3b7-40b0-88d3-d9f649836cd5',NULL,now(),NULL,'migration_seed', 'RELE', 'Decision Released', 'Decision letter has been posted and ready for review'),
      ('b11c03b2-826a-4fbe-a469-f9c5768cf2c8',NULL,now(),NULL,'migration_seed', 'CNCL', 'Cancelled Applications', 'Application has been cancelled'),
      ('264ca7f4-30e3-4566-af1d-f2f3c3d6e8ba',NULL,now(),NULL,'migration_seed', 'ACKC', 'Acknowledged Complete', 'App is complete and ready for LUPs'),
      ('797995b8-3784-404c-af56-e7385f2c8901',NULL,now(),NULL,'migration_seed', 'ACKI', 'Acknowledged Incomplete', 'App is incomplete and requires fixes by Applicant'),
      ('e287ac2d-6296-4f8e-a706-14e67c440fcb',NULL,now(),NULL,'migration_seed', 'VETT', 'To Be Vetted', 'To be Vetted by App Specialist'),
      ('f9f4244f-9741-45f0-9724-ce13e8aa09eb',NULL,now(),NULL,'migration_seed', 'SUBM', 'Submitted to ALC', 'Submitted from ALC Portal');
      `);

    await queryRunner.query(
      `CREATE TABLE "card_subtask_type" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "type" character varying NOT NULL, "background_color" character varying NOT NULL, "text_color" character varying NOT NULL, CONSTRAINT "PK_b2ea292f93c675defa3b3cc93dd" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `INSERT INTO "public"."card_subtask_type" 
        ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "type", "background_color", "text_color") VALUES
        ('f5bef372-0adf-4ac6-adea-a9316529b534', NULL, '2022-09-09 19:14:23.334337+00', '2022-09-09 19:14:23.334337+00', 'alcs-api', NULL, 'GIS', '#A7C7E8', '#002447');`,
    );
    await queryRunner.query(
      `CREATE TABLE "card_subtask" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "completed_at" TIMESTAMP WITH TIME ZONE, "assignee_uuid" uuid, "card_uuid" uuid, "type_uuid" uuid, CONSTRAINT "PK_1196033d1dfc3f1f0d102eb9a6a" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "card_type" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_30b9e07ab7c729f90911604179f" UNIQUE ("code"), CONSTRAINT "UQ_715d4a7d408c461949a6f007a71" UNIQUE ("description"), CONSTRAINT "PK_5a9e11f5a58d23866e129e6981d" PRIMARY KEY ("uuid"))`,
    );

    await queryRunner.query(
      `
      INSERT INTO public.card_type (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"label",code,description) VALUES
	    ('f6df265f-3163-4201-858a-87d4fbd75cbe',NULL,'2022-09-22 13:52:12.366',NULL,'migration_seed',NULL,'Application','APP','Application type card');
      `,
    );

    await queryRunner.query(
      `CREATE TABLE "card" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "high_priority" boolean NOT NULL DEFAULT false, "status_uuid" uuid NOT NULL DEFAULT 'f9f4244f-9741-45f0-9724-ce13e8aa09eb', "board_uuid" uuid NOT NULL DEFAULT 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', "assignee_uuid" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type_uuid" uuid NOT NULL DEFAULT 'f6df265f-3163-4201-858a-87d4fbd75cbe', CONSTRAINT "PK_dc3046f87b3ecabadae16bc4a8b" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "card_history" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" character varying NOT NULL, "status_uuid" uuid NOT NULL, "card_uuid" uuid, CONSTRAINT "PK_72bac9dd2ac14e72ea407e000f3" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "assignee_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "high_priority"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "status_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "board_uuid"`,
    );
    await queryRunner.query(`ALTER TABLE "application" ADD "card_uuid" uuid`);
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "UQ_21eddf92cb75ff3cc0c99b80d86" UNIQUE ("card_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" DROP CONSTRAINT "FK_6c496454f95f229c63679bf191e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" ALTER COLUMN "application_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_acb37fb28b6e19312217e12aaa" ON "comment" ("card_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_acb37fb28b6e19312217e12aaa2" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_subtask" ADD CONSTRAINT "FK_35829d0ec7a6e71391c2349188f" FOREIGN KEY ("assignee_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_subtask" ADD CONSTRAINT "FK_27ad2b929d07d4c4e43943f8e62" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_subtask" ADD CONSTRAINT "FK_b2ea292f93c675defa3b3cc93dd" FOREIGN KEY ("type_uuid") REFERENCES "card_subtask_type"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" ADD CONSTRAINT "FK_97cd2800c2e17e3cb8c24c78987" FOREIGN KEY ("status_uuid") REFERENCES "card_status"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "FK_f3fd3dde1c00cd754841b8b696b" FOREIGN KEY ("status_uuid") REFERENCES "card_status"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "FK_38a14bc9166d9fac12861d07cdd" FOREIGN KEY ("board_uuid") REFERENCES "board"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "FK_e91ded29d40ce244c61402e65fe" FOREIGN KEY ("assignee_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "FK_5a9e11f5a58d23866e129e6981d" FOREIGN KEY ("type_uuid") REFERENCES "card_type"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_history" ADD CONSTRAINT "FK_b9537303955ebb0430c46d95997" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" ADD CONSTRAINT "FK_6c496454f95f229c63679bf191e" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_21eddf92cb75ff3cc0c99b80d86" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP TABLE "application_history"`);
    await queryRunner.query(`DROP TABLE "application_subtask"`);
    await queryRunner.query(`DROP TABLE "application_subtask_type"`);
    await queryRunner.query(`DROP TABLE "application_status"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Not supported');
  }
}
