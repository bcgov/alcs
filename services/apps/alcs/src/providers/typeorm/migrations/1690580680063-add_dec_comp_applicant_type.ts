import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDecCompApplicantType1690580680063
  implements MigrationInterface
{
  name = 'addDecCompApplicantType1690580680063';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "incl_excl_applicant_type" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_component"."incl_excl_applicant_type" IS 'Stores the applicant type for inclusion and exclusion components'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_component"."incl_excl_applicant_type" IS 'Stores the applicant type for inclusion and exclusion components'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "incl_excl_applicant_type"`,
    );
  }
}
