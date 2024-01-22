import { MigrationInterface, QueryRunner } from 'typeorm';

export class addScheduleFlagToBoards1689182264768
  implements MigrationInterface
{
  name = 'addScheduleFlagToBoards1689182264768';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."board" ADD "show_on_schedule" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."board" DROP COLUMN "show_on_schedule"`,
    );
  }
}
