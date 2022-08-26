import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIntakeDates1661538726897 implements MigrationInterface {
  name = 'addIntakeDates1661538726897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" ADD "date_paid" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD "date_acknowledged_incomplete" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD "date_received_all_items" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD "date_acknowledged_complete" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "date_acknowledged_complete"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "date_received_all_items"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "date_acknowledged_incomplete"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "date_paid"`,
    );
  }
}
