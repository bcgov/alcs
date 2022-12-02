import { MigrationInterface, QueryRunner } from 'typeorm';

export class dateToTimestamptz1662153913027 implements MigrationInterface {
  name = 'dateToTimestamptz1662153913027';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE TABLE "application_paused" CASCADE;`);
    await queryRunner.query(
      `ALTER TABLE "application_paused" DROP COLUMN "start_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_paused" ADD "start_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_paused" DROP COLUMN "end_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_paused" ADD "end_date" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_paused" DROP COLUMN "end_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_paused" ADD "end_date" date`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_paused" DROP COLUMN "start_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_paused" ADD "start_date" date NOT NULL DEFAULT now()`,
    );
  }
}
