import { MigrationInterface, QueryRunner } from 'typeorm';

export class IncreasePrecision1699380056668 implements MigrationInterface {
  name = 'IncreasePrecision1699380056668';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" ALTER COLUMN "alr_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" ALTER COLUMN "size" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ALTER COLUMN "alr_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ALTER COLUMN "soil_to_place_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ALTER COLUMN "soil_to_remove_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ALTER COLUMN "alr_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ALTER COLUMN "alr_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ALTER COLUMN "alr_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "nfu_hectares" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "nfu_total_fill_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "tur_total_corridor_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "soil_to_remove_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "soil_already_removed_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "soil_to_place_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "soil_already_placed_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "naru_floor_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "naru_to_place_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "incl_excl_hectares" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" ALTER COLUMN "total_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" ALTER COLUMN "alr_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ALTER COLUMN "soil_to_remove_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ALTER COLUMN "soil_already_removed_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ALTER COLUMN "soil_to_place_area" TYPE numeric(15,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ALTER COLUMN "soil_already_placed_area" TYPE numeric(15,5)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ALTER COLUMN "soil_already_placed_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ALTER COLUMN "soil_to_place_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ALTER COLUMN "soil_already_removed_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ALTER COLUMN "soil_to_remove_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" ALTER COLUMN "alr_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_submission" ALTER COLUMN "total_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "incl_excl_hectares" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "naru_to_place_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "naru_floor_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "soil_already_placed_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "soil_to_place_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "soil_already_removed_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "soil_to_remove_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "tur_total_corridor_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "nfu_total_fill_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ALTER COLUMN "nfu_hectares" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ALTER COLUMN "alr_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ALTER COLUMN "alr_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ALTER COLUMN "alr_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ALTER COLUMN "soil_to_remove_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ALTER COLUMN "soil_to_place_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ALTER COLUMN "alr_area" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" ALTER COLUMN "size" TYPE numeric(12,5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component_lot" ALTER COLUMN "alr_area" TYPE numeric(12,5)`,
    );
  }
}
