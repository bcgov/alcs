import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPfrsFieldsToSubmission1683231592603
  implements MigrationInterface
{
  name = 'addPfrsFieldsToSubmission1683231592603';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_is_extraction_or_mining" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_has_submitted_notice" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_has_submitted_notice"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_is_extraction_or_mining"`,
    );
  }
}
