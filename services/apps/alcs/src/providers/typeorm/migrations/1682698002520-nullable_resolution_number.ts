import { MigrationInterface, QueryRunner } from 'typeorm';

export class nullableResolutionNumber1682698002520
  implements MigrationInterface
{
  name = 'nullableResolutionNumber1682698002520';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "resolution"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ALTER COLUMN "resolution_number" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "resolution" UNIQUE ("resolution_number", "resolution_year")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "resolution"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ALTER COLUMN "resolution_number" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "resolution" UNIQUE ("resolution_number", "resolution_year")`,
    );
  }
}
