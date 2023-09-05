import { MigrationInterface, QueryRunner } from 'typeorm';

export class cleanUpNotificationParcels1693940144496
  implements MigrationInterface
{
  name = 'cleanUpNotificationParcels1693940144496';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_parcel" DROP COLUMN "is_confirmed_by_applicant"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_parcel" ADD "is_confirmed_by_applicant" boolean NOT NULL DEFAULT false`,
    );
  }
}
