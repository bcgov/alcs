import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedApplicationStatus1658160165559 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO public.application_status (
        uuid, "audit_deleted_date_at", "audit_created_at", "audit_updated_at", audit_created_by, code, label, description) VALUES
        ('e6ddd1af-1cb9-4e45-962a-92e8d532b149',NULL,now(),NULL,'migration_seed', 'INCO', 'Incoming / Prelim Review', 'Application is under preliminary review'),
        ('fac4b88a-9c1a-41f4-885c-408ba6c095ec',NULL,now(),NULL,'migration_seed', 'PREL', 'App Prelim Done/To Be Assigned to LUP', 'Preliminary review complete, ready to be assigned'),
        ('b9fc6416-95c3-40f9-9d32-5e7e3d1231b9',NULL,now(),NULL,'migration_seed', 'PREP', 'Application Prep', 'Preparation is in progress'),
        ('aa5bb0f3-8e50-479c-8c99-105a6d3e2565',NULL,now(),NULL,'migration_seed', 'MEET', 'Site Visit Scheduled / Applicant Meeting', 'Site visit or meeting scheduled with applicant'),
        ('42384f47-d6d1-4b5e-ad9c-a66fc754dd52',NULL,now(),NULL,'migration_seed', 'STAF', 'Staff Report Review', 'Report is ready for review by staff'),
        ('64944bb8-f2f2-4709-9062-214f5c4d3187',NULL,now(),NULL,'migration_seed', 'READ', 'Ready for Review sent / Going to Next Decision Meeting', 'Report is ready to be reviewed by panel in a meeting'),
        ('5f233a50-97ec-44d3-af56-309f0cdeb29d',NULL,now(),NULL,'migration_seed', 'DRAF', 'Drafting Decision', 'Meeting completed and decision letter is being drafted'),
        ('f784320d-57bb-4021-bdca-203923c34dbe',NULL,now(),NULL,'migration_seed', 'MANA', 'Manager Draft Review', 'Decision letter is drafted and waiting for review'),
        ('1c70dd1f-4373-4999-818e-bffcaaa7f30b',NULL,now(),NULL,'migration_seed', 'PEND', 'Pending Commissioner Sign-Off', 'Decision letter has completed review and waiting commissioner sign off'),
        ('ddc41949-f3b7-40b0-88d3-d9f649836cd5',NULL,now(),NULL,'migration_seed', 'RELE', 'Decision Released', 'Decision letter has been posted and ready for review'),
        ('b11c03b2-826a-4fbe-a469-f9c5768cf2c8',NULL,now(),NULL,'migration_seed', 'CNCL', 'Cancelled Applications', 'Application has been cancelled');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from public.application_status`);
  }
}
