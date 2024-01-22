import { MigrationInterface, QueryRunner } from 'typeorm';

export class combineFollowUpColumnsForSoil1691015035940
  implements MigrationInterface
{
  name = 'combineFollowUpColumnsForSoil1691015035940';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_is_follow_up" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_follow_up_ids" text`,
    );

    //Combine
    await queryRunner.query(
      `UPDATE "alcs"."application_submission" SET "soil_follow_up_ids" = "soil_noi_ids" || ', ' || "soil_application_ids"`,
    );

    await queryRunner.query(
      `UPDATE "alcs"."application_submission" SET "soil_is_follow_up" = "soil_is_noi_follow_up" OR "soil_has_previous_alc_authorization"`,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_is_noi_follow_up"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_noi_ids"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_has_previous_alc_authorization"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_application_ids"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_follow_up_ids"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_is_follow_up"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_application_ids" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_has_previous_alc_authorization" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_noi_ids" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_is_noi_follow_up" boolean`,
    );
  }
}
