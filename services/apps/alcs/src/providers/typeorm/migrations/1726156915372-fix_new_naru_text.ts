import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixNewNaruText1726156915372 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        update  alcs.application_type at
        set     html_description = 'Choose this option if you are proposing to conduct a non-adhering residential use within the Agricultural Land Reserve under
        <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section20.1">Section 20.1(2) of the Agricultural Land Commission Act.</a>
        <br /><br />
        Non-adhering residential uses include:
        <ul>
            <li>Additional residence(s)</li>
            <li>Residence(s) with Total Floor Area greater than 500 m²</li>
            <li>Retain an existing residence while building a new residence</li>
            <li>Temporary foreign worker housing</li>
        </ul>
        '
        where   at.code = 'NARU';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        update  alcs.application_type at
        set     html_description = 'Choose this option if you are proposing to conduct a non-adhering residential use within the Agricultural Land Reserve under
        <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section20.1">Section 20.1(2) of the Agricultural Land Commission Act.</a>
        <br /><br />
        Non-adhering residential uses include:
        <ul>
            <li>An additional residence(s)</li>
            <li>A residential structure larger than 500 m²</li>
            <li>Retain an existing residence while building a new residence</li>
            <li>Temporary foreign worker housing</li>
        </ul>
        '
        where   at.code = 'NARU';
    `);
  }
}
