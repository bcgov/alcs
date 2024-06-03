import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCancFromRffgApps1717452186426 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      UPDATE alcs.application_submission_to_submission_status astss1
      SET effective_date = NULL, email_sent_date = NULL
      FROM alcs.application_submission_to_submission_status astss2
      WHERE astss1.submission_uuid = astss2.submission_uuid  
      AND astss1.status_type_code = 'CANC'
      AND astss2.status_type_code = 'RFFG'
      AND astss1.effective_date IS NOT NULL
      AND astss2.effective_date IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // N/A
  }
}
