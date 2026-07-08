import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCAndENotice1782281994300 implements MigrationInterface {
  name = 'AddCAndENotice1782281994300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "alcs"."compliance_and_enforcement_notice_type_enum" AS ENUM('Compliance Notice', 'Notice of Contravention', 'Notice of Consideration of Penalty', 'Notice of Debt Collection')`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."compliance_and_enforcement_notice" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_draft" boolean NOT NULL DEFAULT true, "date" date, "type" "alcs"."compliance_and_enforcement_notice_type_enum", "alleged_activity" "alcs"."compliance_and_enforcement_alleged_activity_enum" array NOT NULL DEFAULT '{}', "entry_uuid" uuid, CONSTRAINT "PK_d554901eb8b662c2eb1ded46bf7" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."compliance_and_enforcement_notice" IS 'Compliance and enforcement chronology entry'`,
    );
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_document" ADD "notice_uuid" uuid`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_notice" ADD CONSTRAINT "FK_9229126fdeede68ac68c539c24a" FOREIGN KEY ("entry_uuid") REFERENCES "alcs"."compliance_and_enforcement_chronology_entry"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_document" ADD CONSTRAINT "FK_71a573e06b00b3b6690ac0ee382" FOREIGN KEY ("notice_uuid") REFERENCES "alcs"."compliance_and_enforcement_notice"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_document" DROP CONSTRAINT "FK_71a573e06b00b3b6690ac0ee382"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_notice" DROP CONSTRAINT "FK_9229126fdeede68ac68c539c24a"`,
    );
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_document" DROP COLUMN "notice_uuid"`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_notice" IS NULL`);
    await queryRunner.query(`DROP TABLE "alcs"."compliance_and_enforcement_notice"`);
    await queryRunner.query(`DROP TYPE "alcs"."compliance_and_enforcement_notice_type_enum"`);
  }
}
