import { MigrationInterface, QueryRunner } from 'typeorm';

export class addInclExclApplicantTypeToApplication1690485189579
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "incl_excl_applicant_type" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."incl_excl_applicant_type" IS 'Inclusion Exclusion Applicant Type'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."incl_excl_applicant_type" IS 'Inclusion Exclusion Applicant Type'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "incl_excl_applicant_type"`,
    );
  }
}
