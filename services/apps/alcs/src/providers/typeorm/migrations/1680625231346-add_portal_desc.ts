import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPortalDesc1680625231346 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "html_description"='Choose this option if you are proposing to subdivide land within the Agricultural Land Reserve under
        <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section21">Section 21(2) of the Agricultural Land Commission Act.</a>     
      ' WHERE "code"='SUBD'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_label"='Subdivide Land in the ALR' WHERE "code"='SUBD' `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //No
  }
}
