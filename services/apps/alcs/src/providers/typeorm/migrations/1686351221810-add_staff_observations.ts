import { MigrationInterface, QueryRunner } from 'typeorm';

export class addStaffObservations1686351221810 implements MigrationInterface {
  name = 'addStaffObservations1686351221810';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "staff_observations" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."staff_observations" IS 'ALC Staff Observations and Comments'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."staff_observations" IS 'ALC Staff Observations and Comments'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "staff_observations"`,
    );
  }
}
