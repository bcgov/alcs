import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSubtasks1662749045180 implements MigrationInterface {
  name = 'addSubtasks1662749045180';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "application_subtask_type" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "type" character varying NOT NULL, "background_color" character varying NOT NULL, "text_color" character varying NOT NULL, CONSTRAINT "PK_395e8b9da47fe0a88b3fa8f6a53" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "application_subtask" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "completed_at" TIMESTAMP, "assignee_uuid" uuid, "application_uuid" uuid, "type_uuid" uuid, CONSTRAINT "PK_25ce03514d4bbd0c997cc28955b" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_subtask" ADD CONSTRAINT "FK_efc3830e9500c96573b1daa7522" FOREIGN KEY ("assignee_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_subtask" ADD CONSTRAINT "FK_bf49d4ecd55fb885bd570fa9c47" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_subtask" ADD CONSTRAINT "FK_395e8b9da47fe0a88b3fa8f6a53" FOREIGN KEY ("type_uuid") REFERENCES "application_subtask_type"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_subtask" DROP CONSTRAINT "FK_395e8b9da47fe0a88b3fa8f6a53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_subtask" DROP CONSTRAINT "FK_bf49d4ecd55fb885bd570fa9c47"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_subtask" DROP CONSTRAINT "FK_efc3830e9500c96573b1daa7522"`,
    );
    await queryRunner.query(`DROP TABLE "application_subtask"`);
    await queryRunner.query(`DROP TABLE "application_subtask_type"`);
  }
}
