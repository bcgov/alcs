import { MigrationInterface, QueryRunner } from 'typeorm';

export class rosoNoiAdditionalSoilFields1692046187722
  implements MigrationInterface
{
  name = 'rosoNoiAdditionalSoilFields1692046187722';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_is_removing_soil_for_new_structure" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_structure_farm_use_reason" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_structure_residential_use_reason" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_agri_parcel_activity" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_structure_residential_accessory_use_reason" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_proposed_structures" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."soil_proposed_structures" IS 'JSONB Column containing the proposed structures'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."soil_proposed_structures" IS 'JSONB Column containing the proposed structures'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_proposed_structures"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_structure_residential_accessory_use_reason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_agri_parcel_activity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_structure_residential_use_reason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_structure_farm_use_reason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_is_removing_soil_for_new_structure"`,
    );
  }
}
