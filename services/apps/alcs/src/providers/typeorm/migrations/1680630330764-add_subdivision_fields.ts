import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSubdivisionFields1680630330764 implements MigrationInterface {
  name = 'addSubdivisionFields1680630330764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "subd_purpose" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "subd_suitability" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "subd_agriculture_support" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "subd_is_home_site_severance" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "subd_is_home_site_severance"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "subd_agriculture_support"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "subd_suitability"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "subd_purpose"`,
    );
  }
}
