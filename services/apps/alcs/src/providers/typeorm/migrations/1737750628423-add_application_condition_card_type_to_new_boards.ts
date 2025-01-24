import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApplicationConditionCardTypeToNewBoards1737750628423 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          INSERT INTO alcs.board_allowed_card_types_card_type (board_uuid, card_type_code)
          SELECT b.uuid, 'APPCON'
          FROM alcs.board b
          WHERE b.code IN ('ceo', 'exec', 'film', 'island', 'inte', 'soil', 'okan', 'koot', 'north', 'south');
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          DELETE FROM alcs.board_allowed_card_types_card_type
          WHERE card_type_code = 'APPCON'
          AND alcs.board_uuid IN (SELECT uuid FROM alcs.board WHERE code IN ('ceo', 'exec', 'film', 'island', 'inte', 'soil', 'okan', 'koot', 'north', 'south'));
        `);
  }
}
