import { MigrationInterface, QueryRunner } from 'typeorm';

export class addInclexclFieldsToSubmission1689973655105
  implements MigrationInterface
{
  name = 'addInclexclFieldsToSubmission1689973655105';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "purpose" text`,
    );

    await queryRunner.query(
      `UPDATE "alcs"."application_submission" SET "purpose" = CONCAT(nfu_purpose, tur_purpose, subd_purpose, soil_purpose, naru_purpose)`,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "nfu_purpose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "tur_purpose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "subd_purpose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_purpose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_purpose"`,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "prescribed_body" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "incl_excl_hectares" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "excl_why_land" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "incl_agriculture_support" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "incl_improvements" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "incl_improvements"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "incl_agriculture_support"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "excl_why_land"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "incl_excl_hectares"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "prescribed_body"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "purpose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_purpose" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_purpose" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "subd_purpose" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "tur_purpose" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "nfu_purpose" text`,
    );
  }
}
