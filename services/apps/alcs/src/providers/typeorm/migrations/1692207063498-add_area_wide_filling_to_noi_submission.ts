import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAreaWideFillingToNoiSubmission1692207063498
  implements MigrationInterface
{
  name = 'addAreaWideFillingToNoiSubmission1692207063498';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_is_area_wide_filling" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_is_area_wide_filling"`,
    );
  }
}
