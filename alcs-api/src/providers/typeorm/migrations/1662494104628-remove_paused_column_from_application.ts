import { MigrationInterface, QueryRunner } from 'typeorm';

export class removePausedColumnFromApplication1662494104628
  implements MigrationInterface
{
  name = 'removePausedColumnFromApplication1662494104628';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "paused"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" ADD "paused" boolean NOT NULL DEFAULT false`,
    );
  }
}
