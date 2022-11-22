import { MigrationInterface, QueryRunner } from 'typeorm';

export class newDecisionFields1665684716651 implements MigrationInterface {
  name = 'newDecisionFields1665684716651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ceo_criterion" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, "number" integer NOT NULL, CONSTRAINT "UQ_551aed79586bcf3cf859e148717" UNIQUE ("description"), CONSTRAINT "PK_05d229608ab1d85c0c616803fce" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "decision_maker" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_93d14f2a437bd125e8881760177" UNIQUE ("description"), CONSTRAINT "PK_9dfb1aa358567693c26014ecc18" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD "is_time_extension" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD "decision_maker_code" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD "ceo_criterion_code" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "FK_9bfe649b67952a226317fc3c1ae" FOREIGN KEY ("decision_maker_code") REFERENCES "decision_maker"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "FK_421d167684e2e83d826f939bea7" FOREIGN KEY ("ceo_criterion_code") REFERENCES "ceo_criterion"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "FK_421d167684e2e83d826f939bea7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "FK_9bfe649b67952a226317fc3c1ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP COLUMN "ceo_criterion_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP COLUMN "decision_maker_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP COLUMN "is_time_extension"`,
    );
    await queryRunner.query(`DROP TABLE "decision_maker"`);
    await queryRunner.query(`DROP TABLE "ceo_criterion"`);
  }
}
