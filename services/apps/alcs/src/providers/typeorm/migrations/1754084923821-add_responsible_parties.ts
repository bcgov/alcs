import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResponsibleParties1754084923821 implements MigrationInterface {
    name = 'AddResponsibleParties1754084923821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enums for responsible party
        await queryRunner.query(`CREATE TYPE "alcs"."compliance_and_enforcement_responsible_party_party_type_enum" AS ENUM('Property Owner', 'Lessee/Tenant', 'Operator', 'Contractor')`);
        await queryRunner.query(`CREATE TYPE "alcs"."compliance_and_enforcement_responsible_party_foippa_category_enum" AS ENUM('Individual', 'Organization')`);
        
        // Create responsible party director table
        await queryRunner.query(`CREATE TABLE "alcs"."compliance_and_enforcement_responsible_party_director" (
            "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), 
            "director_name" text NOT NULL, 
            "director_mailing_address" text NOT NULL, 
            "director_telephone" text, 
            "director_email" text, 
            "responsible_party_uuid" uuid, 
            CONSTRAINT "PK_compliance_and_enforcement_responsible_party_director" PRIMARY KEY ("uuid")
        )`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_responsible_party_director" IS 'Compliance and enforcement responsible party director'`);
        
        // Create responsible party table
        await queryRunner.query(`CREATE TABLE "alcs"."compliance_and_enforcement_responsible_party" (
            "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), 
            "party_type" "alcs"."compliance_and_enforcement_responsible_party_party_type_enum" NOT NULL, 
            "foippa_category" "alcs"."compliance_and_enforcement_responsible_party_foippa_category_enum" NOT NULL DEFAULT 'Individual', 
            "is_previous" boolean NOT NULL DEFAULT false, 
            "individual_name" text, 
            "individual_mailing_address" text, 
            "individual_telephone" text, 
            "individual_email" text, 
            "individual_note" text, 
            "organization_name" text, 
            "organization_telephone" text, 
            "organization_email" text, 
            "organization_note" text, 
            "owner_since" TIMESTAMP WITH TIME ZONE, 
            "file_uuid" uuid NOT NULL, 
            CONSTRAINT "PK_compliance_and_enforcement_responsible_party" PRIMARY KEY ("uuid")
        )`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_responsible_party" IS 'Compliance and enforcement responsible party'`);
        
        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_responsible_party_director" ADD CONSTRAINT "FK_responsible_party_director_party_uuid" FOREIGN KEY ("responsible_party_uuid") REFERENCES "alcs"."compliance_and_enforcement_responsible_party"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_responsible_party" ADD CONSTRAINT "FK_responsible_party_file_uuid" FOREIGN KEY ("file_uuid") REFERENCES "alcs"."compliance_and_enforcement"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_responsible_party" DROP CONSTRAINT "FK_responsible_party_file_uuid"`);
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_responsible_party_director" DROP CONSTRAINT "FK_responsible_party_director_party_uuid"`);
        
        // Drop tables
        await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_responsible_party" IS NULL`);
        await queryRunner.query(`DROP TABLE "alcs"."compliance_and_enforcement_responsible_party"`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_responsible_party_director" IS NULL`);
        await queryRunner.query(`DROP TABLE "alcs"."compliance_and_enforcement_responsible_party_director"`);
        
        // Drop enums
        await queryRunner.query(`DROP TYPE "alcs"."compliance_and_enforcement_responsible_party_foippa_category_enum"`);
        await queryRunner.query(`DROP TYPE "alcs"."compliance_and_enforcement_responsible_party_party_type_enum"`);
    }
}
