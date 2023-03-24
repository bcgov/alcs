import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPortalDocLabel1679939638573 implements MigrationInterface {
  name = 'addPortalDocLabel1679939638573';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document_code" ADD "portal_label" character varying`,
    );

    await queryRunner.query(
      `UPDATE "alcs"."application_document_code" SET "portal_label"='Other' WHERE "code"='OTHR'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document_code" DROP COLUMN "portal_label"`,
    );
  }
}
