import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateNotiDescription1695070454420 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "alcs"."card_type" SET "portal_html_description" = 
      'Create a Notification of <a target="_blank" href="https://www.alc.gov.bc.ca/application-and-notice-process/statutory-right-of-way-notice/">Statutory Right of Way</a> if you plan to register a SRW under <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96250_00_multi#section218">s. 218 of the Land Title Act</a> in the ALR.'
      WHERE "code" = 'NOTI';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
