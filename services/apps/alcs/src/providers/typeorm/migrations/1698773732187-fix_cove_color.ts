import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixCoveColor1698773732187 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
       UPDATE "alcs"."application_type" SET "background_color" = '#002447' WHERE "code" = 'COVE';
    `);

    //Prevent Creating V1 Covenants
    await queryRunner.query(`
      DELETE FROM "alcs"."board_create_card_types_card_type" WHERE "card_type_code" = 'COV';
    `);
  }

  public async down(): Promise<void> {
    //Nope
  }
}
