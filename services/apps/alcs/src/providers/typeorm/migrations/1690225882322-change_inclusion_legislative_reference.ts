import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeInclusionLegislativeReference1690225882322
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "html_description"='Choose this option if you are proposing to include land into the Agricultural Land Reserve under
        <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section17">Section 17 of the Agricultural Land Commission Act.</a>
      ' WHERE "code"='INCL'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "html_description"='Choose this option if you are proposing to include land into the Agricultural Land Reserve under
        <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section17">Section 17(3) of the Agricultural Land Commission Act.</a>
      ' WHERE "code"='INCL'`,
    );
  }
}
