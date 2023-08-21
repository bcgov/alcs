import { MigrationInterface, QueryRunner } from 'typeorm';

export class legacyId1692639176392 implements MigrationInterface {
  name = 'legacyId1692639176392';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "legacy_id" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."legacy_id" IS 'Application Id that is applicable only to paper version applications from 70s - 80s'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."legacy_id" IS 'Application Id that is applicable only to paper version applications from 70s - 80s'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "legacy_id"`,
    );
  }
}
