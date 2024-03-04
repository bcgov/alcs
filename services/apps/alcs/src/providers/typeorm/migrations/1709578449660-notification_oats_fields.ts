import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationOatsFields1709578449660 implements MigrationInterface {
  name = 'NotificationOatsFields1709578449660';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_parcel" ADD "oats_subject_property_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_parcel"."oats_subject_property_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_subject_properties to alcs.notification_parcel.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_parcel" ADD "oats_property_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_parcel"."oats_property_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_properties to alcs.notification_parcel.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_parcel"."oats_property_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_properties to alcs.notification_parcel.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_parcel" DROP COLUMN "oats_property_id"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_parcel"."oats_subject_property_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_subject_properties to alcs.notification_parcel.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_parcel" DROP COLUMN "oats_subject_property_id"`,
    );
  }
}
