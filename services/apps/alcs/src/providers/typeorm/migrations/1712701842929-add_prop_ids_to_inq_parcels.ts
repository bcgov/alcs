import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropIdsToInqParcels1712701842929 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_parcel" ADD "oats_subject_property_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_parcel" ADD "oats_property_id" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."inquiry_parcel"."oats_subject_property_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_subject_properties to alcs.inquiry_parcel.'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."inquiry_parcel"."oats_property_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_properties to alcs.inquiry_parcel.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_document" DROP COLUMN "oats_subject_property_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry_document" DROP COLUMN "oats_property_id"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."inquiry_parcel"."oats_subject_property_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_subject_properties to alcs.inquiry_parcel.'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."inquiry_parcel"."oats_property_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_properties to alcs.inquiry_parcel.'`,
    );
  }
}
