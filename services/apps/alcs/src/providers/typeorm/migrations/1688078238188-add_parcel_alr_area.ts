import { MigrationInterface, QueryRunner } from 'typeorm';

export class addParcelAlrArea1688078238188 implements MigrationInterface {
  name = 'addParcelAlrArea1688078238188';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD "alr_area" numeric(12,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP COLUMN "alr_area"`,
    );
  }
}
