import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateColumnText1695408288984 implements MigrationInterface {
  name = 'updateColumnText1695408288984';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission"."parcels_agriculture_description" IS 'Describe all agriculture that currently takes place on the parcel(s).'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission"."parcels_agriculture_improvement_description" IS 'Describe all agricultural improvements made to the parcel(s).'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission"."parcels_non_agriculture_use_description" IS 'Describe all other uses that currently take place on the parcel(s).'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."parcels_agriculture_description" IS 'Describe all agriculture that currently takes place on the parcel(s).'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."parcels_agriculture_improvement_description" IS 'Describe all agricultural improvements made to the parcel(s).'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."parcels_non_agriculture_use_description" IS 'Describe all other uses that currently take place on the parcel(s).'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."parcels_non_agriculture_use_description" IS 'Quantify and describe all non-agricultural uses that currently take place on the parcel(s).'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."parcels_agriculture_improvement_description" IS 'Quantify and describe in detail all agricultural improvements made to the parcel(s).'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."parcels_agriculture_description" IS 'Quantify and describe in detail all agriculture that currently takes place on the parcel(s).'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission"."parcels_non_agriculture_use_description" IS 'Quantify and describe all non-agricultural uses that currently take place on the parcel(s).'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission"."parcels_agriculture_improvement_description" IS 'Quantify and describe in detail all agricultural improvements made to the parcel(s).'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission"."parcels_agriculture_description" IS 'Quantify and describe in detail all agriculture that currently takes place on the parcel(s).'`,
    );
  }
}
