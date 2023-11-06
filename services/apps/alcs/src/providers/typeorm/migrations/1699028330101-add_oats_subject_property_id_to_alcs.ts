import { MigrationInterface, QueryRunner } from 'typeorm';

export class addOatsSubjectPropertyIdToAlcs1699028330101
  implements MigrationInterface
{
  name = 'addOatsSubjectPropertyIdToAlcs1699028330101';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" ADD "oats_subject_property_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_parcel"."oats_subject_property_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_subject_properties to alcs.notice_of_intent_parcel.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_parcel"."oats_subject_property_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_subject_properties to alcs.notice_of_intent_parcel.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" DROP COLUMN "oats_subject_property_id"`,
    );
  }
}
