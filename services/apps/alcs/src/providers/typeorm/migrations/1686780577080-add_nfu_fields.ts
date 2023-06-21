import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNfuFields1686780577080 implements MigrationInterface {
  name = 'addNfuFields1686780577080';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_purpose" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_floor_area" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_residence_necessity" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_location_rationale" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_infrastructure" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_existing_structures" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_will_import_fill" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_fill_type" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_fill_origin" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_project_duration_amount" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_project_duration_unit" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_to_place_volume" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_to_place_area" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_to_place_maximum_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_to_place_average_depth" numeric(12,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_to_place_average_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_to_place_maximum_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_to_place_area"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_to_place_volume"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_project_duration_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_project_duration_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_fill_origin"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_fill_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_will_import_fill"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_existing_structures"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_infrastructure"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_location_rationale"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_residence_necessity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_floor_area"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_purpose"`,
    );
  }
}
