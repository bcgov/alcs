import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTableCommentsToPr1709754346579 implements MigrationInterface {
  name = 'AddTableCommentsToPr1709754346579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."planning_review" IS 'A review of a local government or municipalities plan'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."planning_referral" IS 'Planning Referrals represent each pass of a Planning Review with their own cards'`,
    );
  }

  public async down(): Promise<void> {
    //No
  }
}
