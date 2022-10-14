import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameCodeTables1665768508282 implements MigrationInterface {
  name = 'renameCodeTables1665768508282';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "application_decision_outcome_type"
            RENAME TO "decision_outcome_code";`);
    await queryRunner.query(`ALTER TABLE "decision_maker"
          RENAME TO "decision_maker_code";`);
    await queryRunner.query(`ALTER TABLE "ceo_criterion"
          RENAME TO "ceo_criterion_code";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "decision_outcome_code"
            RENAME TO "application_decision_outcome_type";`);
    await queryRunner.query(`ALTER TABLE "decision_maker_code"
          RENAME TO "decision_maker";`);
    await queryRunner.query(`ALTER TABLE "ceo_criterion_code"
          RENAME TO "ceo_criterion";`);
  }
}
