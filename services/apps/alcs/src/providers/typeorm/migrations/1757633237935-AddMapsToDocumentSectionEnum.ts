import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMapsToDocumentSectionEnum1757633237935 implements MigrationInterface {
    name = 'AddMapsToDocumentSectionEnum1757633237935';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE "alcs"."compliance_and_enforcement_document_section_enum" 
            ADD VALUE IF NOT EXISTS 'Maps'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "alcs"."compliance_and_enforcement_document_section_enum_old" AS ENUM('Submission', 'Ownership')`);
    }

}
