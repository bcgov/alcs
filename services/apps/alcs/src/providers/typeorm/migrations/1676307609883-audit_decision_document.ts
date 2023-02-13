import { MigrationInterface, QueryRunner } from 'typeorm';

export class auditDecisionDocument1676307609883 implements MigrationInterface {
  name = 'auditDecisionDocument1676307609883';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" ADD "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" ADD "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" ADD "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" ADD "audit_created_by" character varying NOT NULL DEFAULT 'pre-migration'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" ADD "audit_updated_by" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" ALTER COLUMN "audit_created_by" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" DROP COLUMN "audit_updated_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" DROP COLUMN "audit_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" DROP COLUMN "audit_updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" DROP COLUMN "audit_created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" DROP COLUMN "audit_deleted_date_at"`,
    );
  }
}
