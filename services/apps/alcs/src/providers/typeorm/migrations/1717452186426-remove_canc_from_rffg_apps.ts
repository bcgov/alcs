import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCancFromRffgApps1717452186426 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      update alcs.application_submission_to_submission_status astss1
      set effective_date = null, email_sent_date = null
      from alcs.application_submission_to_submission_status astss2
      where astss1.submission_uuid = astss2.submission_uuid  
      and astss1.status_type_code = 'CANC'
      and astss2.status_type_code = 'RFFG'
      and astss1.effective_date is not null
      and astss2.effective_date is not null
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // N/A
  }
}
