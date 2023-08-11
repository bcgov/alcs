import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSoilFieldsForNoiSubmissions1691792941845
  implements MigrationInterface
{
  name = 'addSoilFieldsForNoiSubmissions1691792941845';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_is_follow_up" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_follow_up_ids" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_type_removed" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_reduce_negative_impacts" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_to_remove_volume" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_to_remove_area" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_to_remove_maximum_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_to_remove_average_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_already_removed_volume" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_already_removed_area" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_already_removed_maximum_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_already_removed_average_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_to_place_volume" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_to_place_area" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_to_place_maximum_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_to_place_average_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_already_placed_volume" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_already_placed_area" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_already_placed_maximum_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_already_placed_average_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_project_duration_amount" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_project_duration_unit" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_fill_type_to_place" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_alternative_measures" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_is_extraction_or_mining" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_has_submitted_notice" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_has_submitted_notice"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_is_extraction_or_mining"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_alternative_measures"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_fill_type_to_place"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_project_duration_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_project_duration_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_already_placed_average_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_already_placed_maximum_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_already_placed_area"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_already_placed_volume"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_to_place_average_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_to_place_maximum_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_to_place_area"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_to_place_volume"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_already_removed_average_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_already_removed_maximum_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_already_removed_area"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_already_removed_volume"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_to_remove_average_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_to_remove_maximum_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_to_remove_area"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_to_remove_volume"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_reduce_negative_impacts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_type_removed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_follow_up_ids"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_is_follow_up"`,
    );
  }
}
