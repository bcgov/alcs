import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNotificationSrwFields1694044003667
  implements MigrationInterface
{
  name = 'addNotificationSrwFields1694044003667';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" ADD "submitters_file_number" character varying`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_submission"."submitters_file_number" IS 'File number provided by Applicant from the LTSA'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" ADD "total_area" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" ADD "has_survey_plan" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" DROP COLUMN "has_survey_plan"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" DROP COLUMN "total_area"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" DROP COLUMN "submitters_file_number"`,
    );
  }
}
