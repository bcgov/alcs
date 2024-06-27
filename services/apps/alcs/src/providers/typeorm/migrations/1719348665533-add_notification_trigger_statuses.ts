import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationTriggerStatuses1719348665533
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      UPDATE alcs.email_status es
      SET trigger_status = 'SUBM'
      WHERE es.parent_type = 'notification'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // N/A
  }
}
