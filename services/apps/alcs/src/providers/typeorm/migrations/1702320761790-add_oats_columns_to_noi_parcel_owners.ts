import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOatsColumnsToNoiParcelOwners1702320761790
  implements MigrationInterface
{
  name = 'AddOatsColumnsToNoiParcelOwners1702320761790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" ADD "oats_property_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_parcel"."oats_property_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_properties to alcs.notice_of_intent_parcel.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_owner" ADD "oats_property_interest_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_owner"."oats_property_interest_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_property_interest to alcs.notice_of_intent_owner.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_owner"."oats_property_interest_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_property_interest to alcs.notice_of_intent_owner.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_owner" DROP COLUMN "oats_property_interest_id"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_parcel"."oats_property_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_properties to alcs.notice_of_intent_parcel.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" DROP COLUMN "oats_property_id"`,
    );
  }
}
