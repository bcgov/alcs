import { MigrationInterface, QueryRunner } from 'typeorm';

export class cardEntity1663354804137 implements MigrationInterface {
  name = 'cardEntity1663354804137';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP CONSTRAINT "FK_e527e6d1acc89174494456e0ad3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_5b6c6dffed9d8dd24903be05473"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_49d8a9170a71a2e7a9e386c945e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_fe6c9e8b98e3f649b598710dfce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" DROP CONSTRAINT "FK_97cd2800c2e17e3cb8c24c78987"`,
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
      `CREATE TABLE "card" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "high_priority" boolean NOT NULL DEFAULT false, "status_uuid" uuid NOT NULL DEFAULT 'f9f4244f-9741-45f0-9724-ce13e8aa09eb', "board_uuid" uuid NOT NULL DEFAULT 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', "assignee_uuid" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_dc3046f87b3ecabadae16bc4a8b" PRIMARY KEY ("uuid"))`,
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
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_8b7f8f8a39a6142e0f7c5ad86f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "region_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD CONSTRAINT "FK_e527e6d1acc89174494456e0ad3" FOREIGN KEY ("application_paused_uuid") REFERENCES "application_paused"("uuid") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_8b7f8f8a39a6142e0f7c5ad86f5" FOREIGN KEY ("region_uuid") REFERENCES "application_region"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "card_history" ADD CONSTRAINT "FK_b9537303955ebb0430c46d95997" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card_history" DROP CONSTRAINT "FK_b9537303955ebb0430c46d95997"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "FK_e91ded29d40ce244c61402e65fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "FK_38a14bc9166d9fac12861d07cdd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "FK_f3fd3dde1c00cd754841b8b696b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" DROP CONSTRAINT "FK_97cd2800c2e17e3cb8c24c78987"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_8b7f8f8a39a6142e0f7c5ad86f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP CONSTRAINT "FK_e527e6d1acc89174494456e0ad3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "region_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_8b7f8f8a39a6142e0f7c5ad86f5" FOREIGN KEY ("region_uuid") REFERENCES "application_region"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD "description" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD "board_uuid" uuid NOT NULL DEFAULT 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2'`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD "status_uuid" uuid NOT NULL DEFAULT 'f9f4244f-9741-45f0-9724-ce13e8aa09eb'`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD "high_priority" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD "assignee_uuid" uuid`,
    );
    await queryRunner.query(`DROP TABLE "card_history"`);
    await queryRunner.query(`DROP TABLE "card"`);
    await queryRunner.query(`DROP TABLE "card_status"`);
    await queryRunner.query(
      `ALTER TABLE "board_status" ADD CONSTRAINT "FK_97cd2800c2e17e3cb8c24c78987" FOREIGN KEY ("status_uuid") REFERENCES "application_status"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_fe6c9e8b98e3f649b598710dfce" FOREIGN KEY ("board_uuid") REFERENCES "board"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_49d8a9170a71a2e7a9e386c945e" FOREIGN KEY ("assignee_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_5b6c6dffed9d8dd24903be05473" FOREIGN KEY ("status_uuid") REFERENCES "application_status"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD CONSTRAINT "FK_e527e6d1acc89174494456e0ad3" FOREIGN KEY ("application_paused_uuid") REFERENCES "application_paused"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
