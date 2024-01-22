import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFillProjectFields1699034386231 implements MigrationInterface {
  name = 'addFillProjectFields1699034386231';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "fill_project_duration_amount" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "fill_project_duration_unit" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "fill_project_duration_amount" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "fill_project_duration_unit" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "fill_project_duration_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "fill_project_duration_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "fill_project_duration_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "fill_project_duration_amount"`,
    );
  }
}
