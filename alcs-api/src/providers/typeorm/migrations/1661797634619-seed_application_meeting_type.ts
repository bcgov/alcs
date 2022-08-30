import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedApplicationMeetingType1661797634619
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO public.application_meeting_type 
     (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"label",code,description) VALUES
	 ('d16114cb-c551-4449-b9ef-83c6d68df487',NULL,'2022-08-29 11:34:50.975287-07',NULL,'migration_seed',NULL,'Site Visit','SV','Site Visit'),
	 ('dcdbb6e0-1641-448d-8748-39e9105f12ce',NULL,'2022-08-29 11:34:50.975287-07',NULL,'migration_seed',NULL,'Applicant Meeting','AM','Applicant Meeting'),
   ('84051f6c-b463-4f7e-9982-62ad21053d3a',NULL,'2022-08-31 14:47:10.833506-07',NULL,'migration_seed',NULL,'Information Request','IR','Information Request')
     ON CONFLICT DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from public.application_meeting_type`);
  }
}
