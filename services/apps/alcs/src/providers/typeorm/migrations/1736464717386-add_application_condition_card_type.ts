import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApplicationConditionCardType1736464717386 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Insert the new card type into the alcs.card_type table
    await queryRunner.query(`
          INSERT INTO alcs.card_type (code, label, description, portal_html_description, audit_created_by)
          VALUES ('APPCON', 'Application Condition', 'Card type for application conditions', '', 'migration_seed');
        `);

    // Step 2: Find the board by code 'appcon'
    const board = await queryRunner.query(`
          SELECT uuid FROM alcs.board WHERE code = 'appcon';
        `);

    if (board.length > 0) {
      const boardUuid = board[0].uuid;

      // Step 3: Add the new card type to the alcs.board_allowed_card_types_card_type table
      await queryRunner.query(`
            INSERT INTO alcs.board_allowed_card_types_card_type (board_uuid, card_type_code)
            VALUES ('${boardUuid}', 'APPCON');
          `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Find the board by code 'appcon'
    const board = await queryRunner.query(`
          SELECT uuid FROM alcs.board WHERE code = 'appcon';
        `);

    if (board.length > 0) {
      const boardUuid = board[0].uuid;

      // Step 2: Remove the new card type from the alcs.board_allowed_card_types_card_type table
      await queryRunner.query(`
            DELETE FROM alcs.board_allowed_card_types_card_type
            WHERE board_uuid = '${boardUuid}' AND card_type_code = 'APPCON';
          `);
    }

    // Step 3: Delete the new card type from the alcs.card_type table
    await queryRunner.query(`
          DELETE FROM alcs.card_type WHERE code = 'APPCON';
        `);
  }
}
