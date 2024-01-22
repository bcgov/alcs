import { MigrationInterface, QueryRunner } from 'typeorm';

export class soilProposalNoi1692315860319 implements MigrationInterface {
  name = 'soilProposalNoi1692315860319';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "proposal_end_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."proposal_end_date" IS 'The date at which the proposal use ends'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."proposal_end_date" IS 'The date at which the proposal use ends'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "proposal_end_date"`,
    );
  }
}
