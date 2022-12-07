import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedAppTypeDescription1670351383784 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "alcs"."application_type" SET "portal_label" = 'Transportation, Utility, or Recreational Trail Uses within the ALR' WHERE "code" = 'TURP'`);
    await queryRunner.query(`
      UPDATE "alcs"."application_type" SET "html_description" = 'Choose this option if you are proposing one of the following uses on ALR land under
      <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/57_2020#section22">Section 22 of the Agricultural Land Reserve General Regulation</a>:
      <ul>
       <li>construction for the purpose of widening an existing road right of way;</li>
       <li>construction of a road within an existing right of way;</li>
       <li>construction of any of the following:
        <ul>
            <li>a new or existing road or railway;</li>
            <li>a new or existing recreational trail;</li>
            <li>a utility corridor use;</li>
            <li>a sewer or water line other than for ancillary utility connections;</li>
            <li>a forest service road under the Forest Act;</li>
        </ul>
        <li>the new use of an existing right of way for a recreational trail;</li>
      </ul>
      ' WHERE "code" = 'TURP';
    `);

    await queryRunner.query(`
      UPDATE "alcs"."application_type" SET "portal_label" = 'Non-Farm Uses within the ALR' WHERE "code" = 'NFUP'`);
    await queryRunner.query(`
      UPDATE "alcs"."application_type" SET "html_description" = 'Choose this option if you are proposing to conduct a non-farm use on ALR land under
      <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section20">Section 20(2) of the Agricultural Land Commission Act</a>.
      If your proposal relates to the placement of fill and/or theremoval of soil, please consider the soil and/or fill application types above.
      ' WHERE "code" = 'NFUP';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
