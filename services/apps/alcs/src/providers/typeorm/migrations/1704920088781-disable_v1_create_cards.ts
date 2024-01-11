import { MigrationInterface, QueryRunner } from 'typeorm';

export class DisableV1CreateCards1704920088781 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
       DELETE FROM "alcs"."board_create_card_types_card_type" WHERE "card_type_code" IN ('NOI', 'APP');
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
