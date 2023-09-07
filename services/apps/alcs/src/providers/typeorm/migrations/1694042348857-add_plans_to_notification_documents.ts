import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPlansToNotificationDocuments1694042348857
  implements MigrationInterface
{
  name = 'addPlansToNotificationDocuments1694042348857';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" ADD "survey_plan_number" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" ADD "control_number" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" DROP COLUMN "control_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" DROP COLUMN "survey_plan_number"`,
    );
  }
}
