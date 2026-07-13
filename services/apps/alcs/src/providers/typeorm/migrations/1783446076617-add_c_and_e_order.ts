import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCAndEOrder1783446076617 implements MigrationInterface {
  name = 'AddCAndEOrder1783446076617';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."compliance_and_enforcement_order_due_date" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "date" date NOT NULL, "completed_date" TIMESTAMP WITH TIME ZONE DEFAULT now(), "comment" text NOT NULL DEFAULT '', "order_uuid" uuid, CONSTRAINT "PK_cd1ca726daed257414aa27f7580" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."compliance_and_enforcement_order_due_date" IS 'Compliance and enforcement chronology order due date'`,
    );
    await queryRunner.query(
      `CREATE TYPE "alcs"."compliance_and_enforcement_order_type_enum" AS ENUM('Stop Work Order', 'Penalty Order', 'Remediation Order', 'Information Order', 'Court Order')`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."compliance_and_enforcement_order" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_draft" boolean NOT NULL DEFAULT true, "date" date, "type" "alcs"."compliance_and_enforcement_order_type_enum", "alleged_activity" "alcs"."compliance_and_enforcement_alleged_activity_enum" array NOT NULL DEFAULT '{}', "notifications" jsonb NOT NULL DEFAULT '[]'::jsonb, "entry_uuid" uuid, "issued_to_individual_responsible_party_uuid" uuid, "issued_to_director_uuid" uuid, CONSTRAINT "PK_ee778ce2546db4c249b00f68558" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."compliance_and_enforcement_order" IS 'Compliance and enforcement chronology entry'`,
    );
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_document" ADD COLUMN "order_uuid" UUID`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_order_due_date" ADD CONSTRAINT "FK_e87fb83241448da3ec449cf9c6b" FOREIGN KEY ("order_uuid") REFERENCES "alcs"."compliance_and_enforcement_order"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_order" ADD CONSTRAINT "FK_14a57d9289929a39c4602792874" FOREIGN KEY ("entry_uuid") REFERENCES "alcs"."compliance_and_enforcement_chronology_entry"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_order" ADD CONSTRAINT "FK_7d3612dc43252881adddcfb7257" FOREIGN KEY ("issued_to_individual_responsible_party_uuid") REFERENCES "alcs"."compliance_and_enforcement_responsible_party"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_order" ADD CONSTRAINT "FK_9a390d00e32cb7c3ad6ed27dc83" FOREIGN KEY ("issued_to_director_uuid") REFERENCES "alcs"."compliance_and_enforcement_responsible_party_director"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_document" ADD CONSTRAINT "FK_8392e9424e61fb84063a5252ffe" FOREIGN KEY ("order_uuid") REFERENCES "alcs"."compliance_and_enforcement_order"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_document" DROP CONSTRAINT "FK_8392e9424e61fb84063a5252ffe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_order" DROP CONSTRAINT "FK_9a390d00e32cb7c3ad6ed27dc83"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_order" DROP CONSTRAINT "FK_7d3612dc43252881adddcfb7257"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_order" DROP CONSTRAINT "FK_14a57d9289929a39c4602792874"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_order_due_date" DROP CONSTRAINT "FK_e87fb83241448da3ec449cf9c6b"`,
    );
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_document" DROP COLUMN "order_uuid"`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_order" IS NULL`);
    await queryRunner.query(`DROP TABLE "alcs"."compliance_and_enforcement_order"`);
    await queryRunner.query(`DROP TYPE "alcs"."compliance_and_enforcement_order_type_enum"`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_order_due_date" IS NULL`);
    await queryRunner.query(`DROP TABLE "alcs"."compliance_and_enforcement_order_due_date"`);
  }
}
