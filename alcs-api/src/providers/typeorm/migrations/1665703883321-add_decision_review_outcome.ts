import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDecisionReviewOutcome1665703883321
  implements MigrationInterface
{
  name = 'addDecisionReviewOutcome1665703883321';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD "chair_review_outcome" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP COLUMN "chair_review_outcome"`,
    );
  }
}
