import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLegacyIdToPlanningReview1709752843125
  implements MigrationInterface
{
  name = 'AddLegacyIdToPlanningReview1709752843125';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_referral" ADD "legacy_id" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_referral" DROP COLUMN "legacy_id"`,
    );
  }
}
