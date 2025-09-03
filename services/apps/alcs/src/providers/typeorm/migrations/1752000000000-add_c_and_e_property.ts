import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCAndEProperty1752000000000 implements MigrationInterface {
    name = 'AddCAndEProperty1752000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "alcs"."compliance_and_enforcement_property" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "civic_address" text NOT NULL DEFAULT '', "legal_description" text NOT NULL DEFAULT '', "local_government_uuid" text NOT NULL DEFAULT '', "region_code" text NOT NULL DEFAULT '', "latitude" numeric(10,7) NOT NULL DEFAULT 0, "longitude" numeric(10,7) NOT NULL DEFAULT 0, "ownership_type_code" text NOT NULL DEFAULT 'SMPL', "pid" text, "pin" text, "area_hectares" numeric(10,2) NOT NULL DEFAULT 0, "alr_percentage" numeric(5,2) NOT NULL DEFAULT 0, "alc_history" text NOT NULL DEFAULT '', "file_uuid" uuid, CONSTRAINT "PK_5a6e7c94e8f0f2b5c7d2a3e4c8b" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_property" IS 'Compliance and enforcement property'`);
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" ADD CONSTRAINT "FK_ce_property_file_uuid" FOREIGN KEY ("file_uuid") REFERENCES "alcs"."compliance_and_enforcement"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" DROP CONSTRAINT "FK_ce_property_file_uuid"`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_property" IS NULL`);
        await queryRunner.query(`DROP TABLE "alcs"."compliance_and_enforcement_property"`);
    }

}
