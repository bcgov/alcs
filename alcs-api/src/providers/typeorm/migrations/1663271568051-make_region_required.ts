import { MigrationInterface, QueryRunner } from 'typeorm';

export class makeRegionRequired1663271568051 implements MigrationInterface {
  name = 'makeRegionRequired1663271568051';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "application" SET "region_uuid"='41ab6a5e-050b-4ff6-a95d-d3161d960347' WHERE "region_uuid" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "region_uuid" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "region_uuid" DROP NOT NULL`,
    );
  }
}
