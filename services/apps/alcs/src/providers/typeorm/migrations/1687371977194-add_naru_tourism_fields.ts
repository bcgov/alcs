import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNaruTourismFields1687371977194 implements MigrationInterface {
  name = 'addNaruTourismFields1687371977194';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_sleeping_units" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_agri_tourism" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_agri_tourism"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_sleeping_units"`,
    );
  }
}
