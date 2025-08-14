import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOwnershipSectionOptionToCAndEDocs1753915081494 implements MigrationInterface {
    name = 'AddOwnershipSectionOptionToCAndEDocs1753915081494'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" DROP CONSTRAINT "FK_ce_property_file_uuid"`);
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" ALTER COLUMN "file_uuid" SET NOT NULL`);
        await queryRunner.query(`ALTER TYPE "alcs"."compliance_and_enforcement_document_section_enum" RENAME TO "compliance_and_enforcement_document_section_enum_old"`);
        await queryRunner.query(`CREATE TYPE "alcs"."compliance_and_enforcement_document_section_enum" AS ENUM('Submission', 'Ownership')`);
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_document" ALTER COLUMN "section" TYPE "alcs"."compliance_and_enforcement_document_section_enum" USING "section"::"text"::"alcs"."compliance_and_enforcement_document_section_enum"`);
        await queryRunner.query(`DROP TYPE "alcs"."compliance_and_enforcement_document_section_enum_old"`);
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" ADD CONSTRAINT "FK_be07d486f062e1891af100d44d1" FOREIGN KEY ("file_uuid") REFERENCES "alcs"."compliance_and_enforcement"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" DROP CONSTRAINT "FK_be07d486f062e1891af100d44d1"`);
        await queryRunner.query(`CREATE TYPE "alcs"."compliance_and_enforcement_document_section_enum_old" AS ENUM('Submission')`);
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_document" ALTER COLUMN "section" TYPE "alcs"."compliance_and_enforcement_document_section_enum_old" USING "section"::"text"::"alcs"."compliance_and_enforcement_document_section_enum_old"`);
        await queryRunner.query(`DROP TYPE "alcs"."compliance_and_enforcement_document_section_enum"`);
        await queryRunner.query(`ALTER TYPE "alcs"."compliance_and_enforcement_document_section_enum_old" RENAME TO "compliance_and_enforcement_document_section_enum"`);
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" ALTER COLUMN "file_uuid" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" ADD CONSTRAINT "FK_ce_property_file_uuid" FOREIGN KEY ("file_uuid") REFERENCES "alcs"."compliance_and_enforcement"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
