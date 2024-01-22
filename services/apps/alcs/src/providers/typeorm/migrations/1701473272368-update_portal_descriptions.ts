import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePortalDescriptions1701473272368
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "alcs"."card_type" SET "portal_html_description" = 
        'Choose this option if you are proposing to exclude, include, subdivide, conduct a non-farm use activity, conduct a residential use, conduct a transportation/utility use, conduct a soil or fill use, or register a restrictive covenant. Please visit the <a href="https://www.alc.gov.bc.ca/application-and-notice-process/applications/" target="_blank">Application</a> and <a href="https://www.alc.gov.bc.ca/application-and-notice-process/applications/fees-and-payment/" target="_blank">Fees and Payment sections of the ALC website for more information.' WHERE "code" = 'APP';
    `);
    await queryRunner.query(`
      UPDATE "alcs"."card_type" SET "portal_html_description" = 
        'Choose this option if you are proposing to remove soil and/or place fill that does not qualify for exemption under <a href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/30_2019#section35" target="_blank">Section 35 of the Agricultural Land Reserve Use Regulation</a>. All Notices of Intent are subject to a $150 fee. Please visit the <a href="https://www.alc.gov.bc.ca/application-and-notice-process/soil-and-fill-notice-of-intent/" target="_blank">Notice of Intent</a> section of the ALC website for more information.' WHERE "code" = 'NOI';
    `);
    await queryRunner.query(`
      UPDATE "alcs"."card_type" SET "portal_html_description" = 
        'Choose this option if you plan to register a SRW under <a href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96250_15#section218" target="_blank">s. 218 of the Land Title Act</a> in the ALR. There is no fee associated. Please visit the <a href="https://www.alc.gov.bc.ca/application-and-notice-process/statutory-right-of-way-notice/" target="_blank">Notification of Statutory Right of Way</a> section of the ALC website for more information.' WHERE "code" = 'NOTI';
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
