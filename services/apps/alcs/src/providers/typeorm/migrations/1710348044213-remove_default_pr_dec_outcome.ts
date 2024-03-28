import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDefaultPrDecOutcome1710348044213
  implements MigrationInterface
{
  name = 'RemoveDefaultPrDecOutcome1710348044213';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision" DROP CONSTRAINT "FK_98f71d634dd9388cf287b02c728"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision" ALTER COLUMN "outcome_code" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision" ALTER COLUMN "outcome_code" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision" ADD CONSTRAINT "FK_98f71d634dd9388cf287b02c728" FOREIGN KEY ("outcome_code") REFERENCES "alcs"."planning_review_decision_outcome_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision" DROP CONSTRAINT "FK_98f71d634dd9388cf287b02c728"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision" ALTER COLUMN "outcome_code" SET DEFAULT 'ENDO'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision" ALTER COLUMN "outcome_code" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_decision" ADD CONSTRAINT "FK_98f71d634dd9388cf287b02c728" FOREIGN KEY ("outcome_code") REFERENCES "alcs"."planning_review_decision_outcome_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
