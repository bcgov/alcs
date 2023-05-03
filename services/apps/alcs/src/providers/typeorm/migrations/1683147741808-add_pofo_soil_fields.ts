import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPofoSoilFields1683147741808 implements MigrationInterface {
  name = 'addPofoSoilFields1683147741808';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_fill_type_to_place" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "soil_alternative_measures" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_alternative_measures"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_fill_type_to_place"`,
    );
  }
}
