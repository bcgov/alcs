import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameNotificationToMessage1693602985709
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "alcs"."notification" RENAME TO "message";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "alcs"."message" RENAME TO "notification";
    `);
  }
}
