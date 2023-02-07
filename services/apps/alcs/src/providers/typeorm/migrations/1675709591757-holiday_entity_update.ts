import { MigrationInterface, QueryRunner } from 'typeorm';

export class holidayEntityUpdate1675709591757 implements MigrationInterface {
  name = 'holidayEntityUpdate1675709591757';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."holiday_entity"."uuid" IS 'Unique identifier that is safe to share.'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."holiday_entity"."name" IS 'Unique name of the stat holiday.'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."holiday_entity"."day" IS 'Unique date that is considered as a holiday and will be skipped in the business days calculation process.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."holiday_entity"."day" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."holiday_entity"."name" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."holiday_entity"."uuid" IS NULL`,
    );
  }
}
