import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoiNotificationDate1686005315523 implements MigrationInterface {
  name = 'addNoiNotificationDate1686005315523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" ADD "outcome_notification_date" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" DROP COLUMN "outcome_notification_date"`,
    );
  }
}
