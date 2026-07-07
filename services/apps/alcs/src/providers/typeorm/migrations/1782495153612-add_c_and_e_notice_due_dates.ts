import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCAndENoticeDueDates1782495153612 implements MigrationInterface {
  name = 'AddCAndENoticeDueDates1782495153612';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."compliance_and_enforcement_notice_due_date" (
        "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
        "date" date NOT NULL,
        "completed_date" TIMESTAMP WITH TIME ZONE,
        "comment" text NOT NULL DEFAULT '',
        "notice_uuid" uuid,
        CONSTRAINT "PK_6e2284845d0fae6e1422592fc03" PRIMARY KEY ("uuid")
      )`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."compliance_and_enforcement_notice_due_date" IS 'Compliance and enforcement chronology notice due date'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_notice_due_date" ADD CONSTRAINT "FK_342004adf376e3321b40571e7fa" FOREIGN KEY ("notice_uuid") REFERENCES "alcs"."compliance_and_enforcement_notice"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_notice_due_date" DROP CONSTRAINT "FK_342004adf376e3321b40571e7fa"`,
    );
    await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_notice_due_date" IS NULL`);
    await queryRunner.query(`DROP TABLE "alcs"."compliance_and_enforcement_notice_due_date"`);
  }
}
