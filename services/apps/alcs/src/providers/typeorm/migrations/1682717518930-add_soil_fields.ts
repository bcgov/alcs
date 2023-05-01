import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSoilFields1682717518930 implements MigrationInterface {
  name = 'addSoilFields1682717518930';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_is_noi_follow_up" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_noi_ids" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_has_previous_alc_authorization" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_application_ids" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_purpose" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_type_removed" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_reduce_negative_impacts" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_to_remove_volume" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_to_remove_area" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_to_remove_maximum_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_to_remove_average_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_already_removed_volume" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_already_removed_area" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_already_removed_maximum_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_already_removed_average_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_project_duration_amount" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_project_duration_unit" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_project_duration_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_project_duration_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_already_removed_average_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_already_removed_maximum_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_already_removed_area"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_already_removed_volume"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_to_remove_average_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_to_remove_maximum_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_to_remove_area"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_to_remove_volume"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_reduce_negative_impacts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_type_removed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_purpose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_application_ids"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_has_previous_alc_authorization"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_noi_ids"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_is_noi_follow_up"`,
    );
  }
}
