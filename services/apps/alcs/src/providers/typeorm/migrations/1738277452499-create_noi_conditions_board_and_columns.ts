import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNoiConditionsBoardAndColumns1738277452499 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert the new board
    await queryRunner.query(`
              INSERT INTO alcs.board (code, title, show_on_schedule, audit_created_by)
              VALUES ('noicon', 'NOI Conditions', false, 'migration_seed')
            `);

    // Get the UUID of the newly inserted board
    const boardUuidResult = await queryRunner.query(`
              SELECT uuid FROM alcs.board WHERE code = 'noicon'
            `);
    const boardUuid = boardUuidResult[0].uuid;

    // Insert new board statuses
    await queryRunner.query(`
              INSERT INTO alcs.board_status (board_uuid, "order", status_code, audit_created_by)
              VALUES 
                ('${boardUuid}', 0, 'FOLL', 'migration_seed'),
                ('${boardUuid}', 1, 'MATR', 'migration_seed'),
                ('${boardUuid}', 2, 'CPRP', 'migration_seed'),
                ('${boardUuid}', 3, 'WAIT', 'migration_seed'),
                ('${boardUuid}', 4, 'CPND', 'migration_seed'),
                ('${boardUuid}', 5, 'COMP', 'migration_seed')
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get the UUID of the board with code 'appcon'
    const boardUuidResult = await queryRunner.query(`
              SELECT uuid FROM alcs.board WHERE code = 'appcon'
            `);
    const boardUuid = boardUuidResult[0].uuid;

    // Delete the board statuses
    await queryRunner.query(`
              DELETE FROM alcs.board_status WHERE board_uuid = '${boardUuid}' AND status_code IN ('FOLL', 'MATR', 'CPRP', 'WAIT', 'CPND', 'COMP')
            `);

    // Delete the board
    await queryRunner.query(`
              DELETE FROM alcs.board WHERE code = 'noicon'
            `);
  }
}
