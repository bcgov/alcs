import { MigrationInterface, QueryRunner } from 'typeorm';

export class prefixApplicationDecisionTables1685640625670
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_document" RENAME TO "application_decision_document"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_maker_code" RENAME TO "application_decision_maker_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."decision_outcome_code" RENAME TO "application_decision_outcome_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."modified_decisions" RENAME TO "application_modified_decisions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."reconsidered_decisions" RENAME TO "application_reconsidered_decisions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."ceo_criterion_code" RENAME TO "application_ceo_criterion_code"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_document" RENAME TO "decision_document"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_maker_code" RENAME TO "decision_maker_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_outcome_code" RENAME TO "decision_outcome_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modified_decisions" RENAME TO "modified_decisions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsidered_decisions" RENAME TO "reconsidered_decisions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_ceo_criterion_code" RENAME TO "ceo_criterion_code"`,
    );
  }
}
