import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssigneeFilterOptionToBoards1744385539178 implements MigrationInterface {
  name = 'AddAssigneeFilterOptionToBoards1744385539178';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "alcs"."board" ADD "has_assignee_filter" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "alcs"."board" DROP COLUMN "has_assignee_filter"`);
  }
}
