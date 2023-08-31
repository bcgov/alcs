import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameGetCurrentStatusFunction1693410289968
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER FUNCTION alcs.get_current_status_for_submission_by_uuid(uuid) RENAME TO get_current_status_for_application_submission_by_uuid;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
