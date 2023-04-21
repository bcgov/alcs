import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAuditToSubmissions1682110498906 implements MigrationInterface {
  name = 'addAuditToSubmissions1682110498906';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "audit_created_by" character varying`,
    );

    await queryRunner.query(
      `UPDATE "alcs"."application_submission" SET "audit_created_by" = 'migration_default'`,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "audit_created_by" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "audit_updated_by" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "audit_updated_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "audit_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "audit_updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "audit_created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "audit_deleted_date_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }
}
