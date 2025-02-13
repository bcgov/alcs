import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveApplicationCardTypeFromConditionBoard1738196945240 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          DELETE FROM alcs.board_allowed_card_types_card_type
          WHERE board_uuid = (
            SELECT uuid FROM alcs.board WHERE code = 'appcon'
          )
          AND card_type_code = 'APP';
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          INSERT INTO alcs.board_allowed_card_types_card_type (board_uuid, card_type_code)
          VALUES (
            (SELECT uuid FROM alcs.board WHERE code = 'appcon'),
            'APP'
          );
        `);
  }
}
