import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeStatsRequired1697580176148 implements MigrationInterface {
  name = 'removeStatsRequired1697580176148';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "is_stats_required"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "is_stats_required"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD "is_stats_required" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "is_stats_required" boolean`,
    );
  }
}
