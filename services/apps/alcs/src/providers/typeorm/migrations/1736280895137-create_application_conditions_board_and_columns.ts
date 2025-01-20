import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApplicationConditionsBoardAndColumns1736280895137 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert the new board
    await queryRunner.query(`
          INSERT INTO alcs.board (code, title, show_on_schedule, audit_created_by)
          VALUES ('appcon', 'Application Conditions', true, 'migration_seed')
        `);

    // Get the UUID of the newly inserted board
    const boardUuidResult = await queryRunner.query(`
          SELECT uuid FROM alcs.board WHERE code = 'appcon'
        `);
    const boardUuid = boardUuidResult[0].uuid;

    // Get the code of the card type with code 'APP'
    const cardTypeCodeResult = await queryRunner.query(`
          SELECT code FROM alcs.card_type WHERE code = 'APP'
        `);
    const cardTypeCode = cardTypeCodeResult[0].code;

    // Insert the allowed card type for the new board
    await queryRunner.query(`
          INSERT INTO alcs.board_allowed_card_types_card_type (board_uuid, card_type_code)
          VALUES ('${boardUuid}', '${cardTypeCode}')
        `);

    // Insert new card statuses
    await queryRunner.query(`
          INSERT INTO alcs.card_status (code, label, description, audit_created_by)
          VALUES 
            ('FOLL', 'Follow-up Required', 'Follow-up required', 'migration_seed'),
            ('MATR', 'Material Received', 'Material received', 'migration_seed'),
            ('CPRP', 'Prep', 'Prep', 'migration_seed'),
            ('WAIT', 'Waiting for Applicant', 'Waiting for applicant', 'migration_seed'),
            ('CPND', 'Pending Sign-off', 'Pending sign-off', 'migration_seed')
        `);

    // Insert new board statuses
    await queryRunner.query(`
          INSERT INTO alcs.board_status (board_uuid, "order", status_code, audit_created_by)
          VALUES 
            ('${boardUuid}', 0, 'FOLL', 'migration_seed'),
            ('${boardUuid}', 1, 'MATR', 'migration_seed'),
            ('${boardUuid}', 2, 'CPRP', 'migration_seed'),
            ('${boardUuid}', 3, 'WAIT', 'migration_seed'),
            ('${boardUuid}', 4, 'CPND', 'migration_seed')
        `);

    // Check if the 'COMP' card status exists
    const compStatusResult = await queryRunner.query(`
          SELECT code FROM alcs.card_status WHERE code = 'COMP'
        `);

    // If 'COMP' status exists, add it to the board statuses
    if (compStatusResult.length > 0) {
      await queryRunner.query(`
            INSERT INTO alcs.board_status (board_uuid, "order", status_code, audit_created_by)
            VALUES ('${boardUuid}', 5, 'COMP', 'migration_seed')
          `);
    }
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

    // Delete the card statuses
    await queryRunner.query(`
          DELETE FROM alcs.card_status WHERE code IN ('FOLL', 'MATR', 'CPRP', 'WAIT', 'CPND')
        `);

    // Delete the allowed card type for the board
    await queryRunner.query(`
          DELETE FROM alcs.board_allowed_card_types_card_type WHERE board_uuid = '${boardUuid}'
        `);

    // Delete the board
    await queryRunner.query(`
          DELETE FROM alcs.board WHERE code = 'appcon'
        `);
  }
}
