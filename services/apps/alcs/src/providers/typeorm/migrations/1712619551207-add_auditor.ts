import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditor1712619551207 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_document" ADD "audit_created_by" varchar`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_document" DROP COLUMN "audit_created_by"`,
    );
  }
}
