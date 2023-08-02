import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAverageFillDepth1690999583806 implements MigrationInterface {
  name = 'addAverageFillDepth1690999583806';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "nfu_average_fill_depth" numeric(12,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "nfu_average_fill_depth"`,
    );
  }
}
