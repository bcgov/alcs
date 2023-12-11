import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOatsPropertyInteresIdToApplicationOwner1701993162234
  implements MigrationInterface
{
  name = 'AddOatsPropertyInteresIdToApplicationOwner1701993162234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD "oats_property_interest_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_owner"."oats_property_interest_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_property_interest to alcs.application_owner. Note that this id is unique only in scope of parcel.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_owner"."oats_property_interest_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_property_interest to alcs.application_owner. Note that this id is unique only in scope of parcel.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP COLUMN "oats_property_interest_id"`,
    );
  }
}
