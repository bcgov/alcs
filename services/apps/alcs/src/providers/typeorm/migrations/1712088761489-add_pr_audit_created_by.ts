import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrAuditCreatedBy1712088761489 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_document" ADD "audit_created_by" varchar`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_document" DROP COLUMN "audit_created_by"`,
    );
  }
}
