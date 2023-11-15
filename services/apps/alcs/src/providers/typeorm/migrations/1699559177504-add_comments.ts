import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddComments1699559177504 implements MigrationInterface {
  name = 'AddComments1699559177504';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "returned_to_lfng_comment" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission"."returned_to_lfng_comment" IS 'Used to store comments when an Application is returned to the L/FNG by ALC Staff'`,
    );

    await queryRunner.query(`
      INSERT INTO "alcs"."application_submission_status_type"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "weight", "alcs_background_color", "alcs_color", "portal_background_color", "portal_color") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'ALC Returned to L/FNG', 'INCG', 'Application was returned to L/FNG from ALC Staff', 4, '#A7C7E8', '#002447', '#f8c0a3', '#83360D');
    `);

    await queryRunner.query(`
      UPDATE "alcs"."application_submission_status_type" SET "weight" = 11 WHERE "code" = 'CANC';
      UPDATE "alcs"."application_submission_status_type" SET "weight" = 10 WHERE "code" = 'RFFG';
      UPDATE "alcs"."application_submission_status_type" SET "weight" = 9 WHERE "code" = 'ALCD';
      UPDATE "alcs"."application_submission_status_type" SET "weight" = 8 WHERE "code" = 'REVA';
      UPDATE "alcs"."application_submission_status_type" SET "weight" = 7 WHERE "code" = 'RECA';
      UPDATE "alcs"."application_submission_status_type" SET "weight" = 6 WHERE "code" = 'SUIN';
      UPDATE "alcs"."application_submission_status_type" SET "weight" = 5 WHERE "code" = 'SUBM';
    `);

    await queryRunner.query(`
    INSERT INTO "alcs"."application_submission_to_submission_status" ("submission_uuid", "status_type_code")
       (SELECT DISTINCT "submission_uuid", 'INCG' from "alcs"."application_submission_to_submission_status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "returned_to_lfng_comment"`,
    );
  }
}
