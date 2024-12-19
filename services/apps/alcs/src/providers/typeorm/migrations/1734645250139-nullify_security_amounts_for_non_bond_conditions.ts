import { MigrationInterface, QueryRunner } from 'typeorm';

export class NullifySecurityAmountsForNonBondConditions1734645250139 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Apps
    queryRunner.query(`
      update
        alcs.application_decision_condition
      set
        security_amount = null
      where
        type_code <> 'BOND';
    `);

    // NOI's
    queryRunner.query(`
      update
        alcs.notice_of_intent_decision_condition
      set
        security_amount = null
      where
        type_code <> 'BOND';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
