import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDisallowedCreateCardTypesFromBoards1717003331488
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `delete from alcs.board_create_card_types_card_type where card_type_code in ('COV', 'RECON', 'MODI', 'NOIM')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
