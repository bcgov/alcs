import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDecisions1664907608894 implements MigrationInterface {
  name = 'addDecisions1664907608894';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "application_decision" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "outcome" character varying NOT NULL, "application_uuid" uuid NOT NULL, CONSTRAINT "PK_f1cbebd03275dcbe1a70d46cebf" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "FK_0c9a7750537b07493a78248b295" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "FK_0c9a7750537b07493a78248b295"`,
    );
    await queryRunner.query(`DROP TABLE "application_decision"`);
  }
}
