import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveRffgFromSelectFiles1718645937227
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      UPDATE alcs.application_submission_to_submission_status astss
      SET effective_date = NULL, email_sent_date = NULL
      FROM alcs.application_submission as2
      WHERE astss.submission_uuid = as2."uuid"
      AND astss.status_type_code = 'RFFG'
      AND as2.file_number IN ('66716', '11073')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // N/A
  }
}
