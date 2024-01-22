import { MigrationInterface, QueryRunner } from 'typeorm';

export class addOatsApplicationSubjectPropertyIdToAlcs1699317537062
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD "oats_subject_property_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_parcel"."oats_subject_property_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_subject_properties to alcs.application_parcel.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_parcel"."oats_subject_property_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_subject_properties to alcs.application_parcel.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP COLUMN "oats_subject_property_id"`,
    );
  }
}
