import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTfwhColumns1727382390880 implements MigrationInterface {
  name = 'MakeTfwhColumns1727382390880';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "tfwh_count" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "tfwh_design" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "tfwh_farm_size" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "tfwh_farm_size"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "tfwh_design"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "tfwh_count"`,
    );
  }
}
