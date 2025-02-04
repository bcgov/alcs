import { MigrationInterface, QueryRunner } from 'typeorm';

export class TurnOffApplicationConditionBoardShowOnSchedule1738089637628 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          UPDATE alcs.board
          SET show_on_schedule = false
          WHERE code = 'appcon'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          UPDATE alcs.board
          SET show_on_schedule = true
          WHERE code = 'appcon'
        `);
  }
}
