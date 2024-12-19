import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanUpOrphanedConditionDates1734395224473 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        delete
        from
            alcs.application_decision_condition_date adcd
        where
            adcd.condition_uuid is null
    `);
    queryRunner.query(`
        delete
        from
            alcs.notice_of_intent_decision_condition_date noidcd
        where
            noidcd.condition_uuid is null
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
