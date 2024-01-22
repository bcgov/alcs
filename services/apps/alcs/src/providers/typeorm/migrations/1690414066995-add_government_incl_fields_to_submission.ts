import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGovernmentInclFieldsToSubmission1690414066995
  implements MigrationInterface
{
  name = 'addGovernmentInclFieldsToSubmission1690414066995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "incl_government_owns_all_parcels" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "incl_government_owns_all_parcels"`,
    );
  }
}
