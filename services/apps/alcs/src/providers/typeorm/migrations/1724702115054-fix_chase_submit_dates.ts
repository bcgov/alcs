import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixChaseSubmitDates1724702115054 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        update		alcs.inquiry i
        set 		date_submitted_to_alc = oi.received_date at time zone 'America/Vancouver'
        from		oats.oats_issues oi
        join		oats.oats_person_organizations gov_pog								on	gov_pog.person_organization_id = oi.local_gov_pog_id
        join    	oats.oats_organizations gov											on  gov.organization_id = gov_pog.organization_id
        where   	gov.organization_name = 'VILLAGE OF CHASE'
        and 		oi.issu_type = 'INQ'
        and			i.file_number = oi.issue_id::text 
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
