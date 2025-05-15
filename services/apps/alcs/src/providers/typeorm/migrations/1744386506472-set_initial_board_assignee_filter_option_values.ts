import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetInitialBoardAssigneeFilterOptionValues1744386506472 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE "alcs"."board" SET "has_assignee_filter" = true
        WHERE "code" IN (
            'film',
            'island',
            'inte',
            'soil',
            'okan',
            'koot',
            'north',
            'south',
            'noi',
            'noicon',
            'appcon'
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // N/A
  }
}
