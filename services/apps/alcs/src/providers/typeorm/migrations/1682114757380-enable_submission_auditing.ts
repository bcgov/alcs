import { MigrationInterface, QueryRunner } from 'typeorm';

export class enableSubmissionAuditing1682114757380
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    //Enable auditing on application_submission, do not store query, do store row data, ignore audit_updated_at
    await queryRunner.query(
      `SELECT audit.audit_table('alcs.application_submission', true, false, '{audit_updated_at}'::text[]);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER audit_trigger_row on alcs.application_submission;
      DROP TRIGGER audit_trigger_stm on alcs.application_submission;
    `);
  }
}
