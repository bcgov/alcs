import { MigrationInterface, QueryRunner } from 'typeorm';

export class addWasReleasedToDecisions1684534105899
  implements MigrationInterface
{
  name = 'addWasReleasedToDecisions1684534105899';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "was_released" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "was_released"`,
    );
  }
}
