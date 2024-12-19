import { MigrationInterface, QueryRunner } from 'typeorm';

export class DisableSecurityAmountForAllNonBondConditionTypes1734646226612 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Apps
    queryRunner.query(`
      update
        alcs.application_decision_condition_type
      set
        is_security_amount_checked = false,
        is_security_amount_required = false
      where
        code <> 'BOND';
    `);

    // NOI's
    queryRunner.query(`
      update
        alcs.notice_of_intent_decision_condition_type
      set
        is_security_amount_checked = false,
        is_security_amount_required = false
      where
        code <> 'BOND';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
