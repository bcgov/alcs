import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeStartEnddate1663110598844 implements MigrationInterface {
  name = 'removeStartEnddate1663110598844';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP COLUMN "start_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP COLUMN "end_date"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD "end_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD "start_date" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
  }
}
