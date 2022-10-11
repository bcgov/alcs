import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNotificationSentDate1665178908879
  implements MigrationInterface
{
  name = 'addNotificationSentDate1665178908879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" ADD "notification_sent_date" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "notification_sent_date"`,
    );
  }
}
