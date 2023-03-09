import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSubmittedApplication1678294290732
  implements MigrationInterface
{
  name = 'addSubmittedApplication1678294290732';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "submitted_application" jsonb`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."submitted_application" IS 'JSONB Column containing the applicants information from the Portal'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."submitted_application" IS 'JSONB Column containing the applicants information from the Portal'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "submitted_application"`,
    );
  }
}
