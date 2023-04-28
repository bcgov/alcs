import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAllPortalLabels1682628852719 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //Placement of Fill
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "html_description"='Choose this option if you are <strong>only</strong> proposing to place fill on ALR land under
        <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section20.3">Section 20.3(5) of the Agricultural Land Commission Act.</a>
        <br /><br />
        Fill includes but is not limited to:
        <ul>
            <li>Aggregate</li>
            <li>Topsoil</li>
            <li>Structural Fill</li>
            <li>Sand</li>
            <li>Gravel</li>
        </ul>     
      ' WHERE "code"='POFO'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_label"='Placement of Fill within the ALR' WHERE "code"='POFO' `,
    );

    //Removal of Soil
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "html_description"='Choose this option if you are only proposing to remove soil from ALR land under
        <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section20.3">Section 20.3(5) of the Agricultural Land Commission Act.</a>
        <br /><br />
        Soil includes but is not limited to:
        <ul>
            <li>Aggregate Extraction</li>
            <li>Placer Mining</li>
            <li>Peat Extraction</li>
            <li>Soil Removal</li>
        </ul>
      ' WHERE "code"='ROSO'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_label"='Removal of Soil (Extraction) within the ALR' WHERE "code"='ROSO' `,
    );

    //Placement of Fill & Removal of Soil
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "html_description"='Choose this option if you are proposing to remove soil <strong>and</strong> place fill on ALR land under
        <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section20.3">Section 20.3(5) of the Agricultural Land Commission Act.</a>
        <br /><br />
        Soil includes but is not limited to:
        <ul>
            <li>Aggregate Extraction</li>
            <li>Placer Mining</li>
            <li>Peat Extraction</li>
            <li>Soil Removal</li>
        </ul>
        <br />
        Fill includes but is not limited to:
        <ul>
            <li>Aggregate</li>
            <li>Topsoil</li>
            <li>Structural Fill</li>
            <li>Sand</li>
            <li>Gravel</li>
        </ul>   
      ' WHERE "code"='PFRS'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_label"='Removal of Soil (Extraction) and Placement of Fill within the ALR' WHERE "code"='PFRS' `,
    );

    //Non-Adhering Residential Use
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "html_description"='Choose this option if you are proposing to conduct a non-adhering residential use within the Agricultural Land Reserve under
        <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section20.1">Section 20.1(2) of the Agricultural Land Commission Act.</a>
        <br /><br />
        Non-adhering residential uses include:
        <ul>
            <li>An additional residence for farm use;</li>
            <li>A residential structure larger than 500 m²; or,</li>
            <li>A non-adhering tourism accommodation.</li>
        </ul>
      ' WHERE "code"='NARU'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_label"='Non-Adhering Residential Use within the ALR' WHERE "code"='NARU' `,
    );

    //Exclude Land from the ALR
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "html_description"='Choose this option if you are proposing to exclude land from the Agricultural Land Reserve under
        <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section29">Section 29 of the Agricultural Land Commission Act.</a>
        <br /><br />
        <strong>Individual landowners may not submit exclusion applications to the ALC. Contact your Local or First Nation government regarding their exclusion request policies.</strong>
        <br /><br />
        A person may apply to exclude land under s.29 only if they are:
        <ul>
            <li>the owner of the land <strong>and</strong> are the Province, First Nation Government, Local Government, or a <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/57_2020#section16">prescribed public body;</a></li>
            <li>a local government, and the land is within the local government''s jurisdiction; OR</li>
            <li>a first nation government, and the land is within the first nation''s settlement lands.</li>
        </ul>
      ' WHERE "code"='EXCL'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_label"='Exclude Land from the ALR' WHERE "code"='EXCL' `,
    );

    //Include Land
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "html_description"='Choose this option if you are proposing to include land into the Agricultural Land Reserve under
        <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section17">Section 17(3) of the Agricultural Land Commission Act.</a>
      ' WHERE "code"='INCL'`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_label"='Include Land into the ALR' WHERE "code"='INCL' `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //No Pls
  }
}
