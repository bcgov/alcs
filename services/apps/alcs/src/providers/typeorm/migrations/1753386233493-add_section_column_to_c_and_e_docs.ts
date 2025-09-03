import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSectionColumnToCAndEDocs1753386233493 implements MigrationInterface {
  name = 'AddSectionColumnToCAndEDocs1753386233493';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "alcs"."compliance_and_enforcement_document_section_enum" AS ENUM('Submission')`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_document" ADD "section" "alcs"."compliance_and_enforcement_document_section_enum" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_document" DROP COLUMN "section"`);
    await queryRunner.query(`DROP TYPE "alcs"."compliance_and_enforcement_document_section_enum"`);
  }
}
