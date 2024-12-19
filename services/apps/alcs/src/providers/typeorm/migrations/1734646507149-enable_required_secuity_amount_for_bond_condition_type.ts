import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableRequiredSecuityAmountForBondConditionType1734646507149 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Apps
    queryRunner.query(`
      update
        alcs.application_decision_condition_type
      set
        is_security_amount_checked = true,
        is_security_amount_required = true
      where
        code = 'BOND';
    `);

    // NOI's
    queryRunner.query(`
      update
        alcs.notice_of_intent_decision_condition_type
      set
        is_security_amount_checked = true,
        is_security_amount_required = true
      where
        code = 'BOND';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
