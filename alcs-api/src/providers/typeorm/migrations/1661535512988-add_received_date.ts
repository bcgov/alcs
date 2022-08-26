import { MigrationInterface, QueryRunner } from 'typeorm';

export class addReceivedDate1661535512988 implements MigrationInterface {
  name = 'addReceivedDate1661535512988';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" ADD "date_received" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()`,
    );

    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "date_received" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "date_received"`,
    );
  }
}
