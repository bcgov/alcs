import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCAndEProperty1752000000000 implements MigrationInterface {
    name = 'AddCAndEProperty1752000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "alcs"."compliance_and_enforcement_property" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "civic_address" text NOT NULL, "legal_description" text NOT NULL, "local_government_uuid" text NOT NULL, "region_code" text, "latitude" numeric(10,7) NOT NULL, "longitude" numeric(10,7) NOT NULL, "ownership_type_code" text NOT NULL, "pid" text, "pin" text, "area_hectares" numeric(10,2) NOT NULL, "alr_percentage" numeric(5,2) NOT NULL, "alc_history" text NOT NULL, "file_uuid" uuid, CONSTRAINT "PK_5a6e7c94e8f0f2b5c7d2a3e4c8b" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_property" IS 'Compliance and enforcement property'`);
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" ADD CONSTRAINT "FK_ce_property_file_uuid" FOREIGN KEY ("file_uuid") REFERENCES "alcs"."compliance_and_enforcement"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" DROP CONSTRAINT "FK_ce_property_file_uuid"`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_property" IS NULL`);
        await queryRunner.query(`DROP TABLE "alcs"."compliance_and_enforcement_property"`);
    }

} 