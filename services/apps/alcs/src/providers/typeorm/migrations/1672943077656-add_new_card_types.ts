import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNewCardTypes1672943077656 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "alcs"."card_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "portal_html_description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Notice of Intent', 'NOI', 'Card type for NOI','Create a <a target="_blank" href="https://www.alc.gov.bc.ca/application-and-notice-process/soil-and-fill-notice-of-intent/">Notice of Intent</a> if you are proposing to remove soil and/or place fill that does not qualify for exemption under Section 35 of the <i>Agricultural Land Reserve Use Regulation</i>. All notices are subject to a $150 fee.'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Notification of Statutory Right of Way (SRW)', 'SRW', 'Card type for SRW', 'Create a <a target="_blank" href="https://www.alc.gov.bc.ca/application-and-notice-process/statutory-right-of-way-notice/"> Notification of Statutory Right of Way (SRW)</a> if you are notifying the ALC that you are planning to register a SRW under section 218 of the <i>Land Title Act</i> in accordance with section 18.1 (2) of the <i>Agricultural Land Commission Act</i>.');
    `);

    await queryRunner.query(`
        UPDATE "alcs"."card_type" 
        SET portal_html_description = 'Create an <a target="_blank" href="https://www.alc.gov.bc.ca/application-and-notice-process/applications/">Application</a> if you are proposing to exclude, include, subdivide, conduct a non-farm use activity, conduct a non-adhering residential use, conduct a transportation/utility/recreational trail use, or conduct a soil or fill use. Non-adhering residential use applications have a fee of $750. All other applications have a fee of $1,500 fee, except for inclusion of land (no fee). Application fees are split equally between the local government and the ALC.'
        WHERE code = 'APP';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."card_type" WHERE code IN ('NOI', 'SRW')`,
    );

    await queryRunner.query(
      `UPDATE "alcs"."card_type" 
       SET portal_html_description = ''
       WHERE code = 'APP';`,
    );
  }
}
