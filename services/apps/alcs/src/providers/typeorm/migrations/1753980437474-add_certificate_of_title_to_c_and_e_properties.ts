import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCertificateOfTitleToCAndEProperties1753980437474 implements MigrationInterface {
    name = 'AddCertificateOfTitleToCAndEProperties1753980437474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" ADD "certificate_of_title_uuid" uuid`);
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" ADD CONSTRAINT "UQ_7112fe1c28a2a72ff74aa16689a" UNIQUE ("certificate_of_title_uuid")`);
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" ADD CONSTRAINT "FK_7112fe1c28a2a72ff74aa16689a" FOREIGN KEY ("certificate_of_title_uuid") REFERENCES "alcs"."compliance_and_enforcement_document"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" DROP CONSTRAINT "FK_7112fe1c28a2a72ff74aa16689a"`);
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" DROP CONSTRAINT "UQ_7112fe1c28a2a72ff74aa16689a"`);
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_property" DROP COLUMN "certificate_of_title_uuid"`);
    }

}
