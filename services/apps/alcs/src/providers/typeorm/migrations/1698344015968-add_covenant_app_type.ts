import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCovenantAppType1698344015968 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."application_type" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "short_label", "background_color", "text_color", "html_description", "portal_label", "requires_government_review") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Restrictive Covenant', 'COVE', 'Restrictive Covenants', 'COV', '#c12bdb', '#fff', 
        'Choose this option if you are proposing one of the following uses on ALR land that restricts or prohibits the use of agricultural land for farm purposes under 
        <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section22">Section 22(2) of the Agricultural Land Commission Act.</a><br /><br />
        Including but not limited to:
        <ul>
         <li>placing a covenant for ecological / habitat conservation;</li>
        </ul><br />
        To remove a restrictive covenant from land in the ALR or to satisfy a covenant condition of a previous ALC approval, please contact an ALC Land Use Planner in your region:
         <a target="_blank" href="https://www.alc.gov.bc.ca/contact/">Contact Us</a>
        ', 'Register a Restrictive Covenant within the ALR', 'f');
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
