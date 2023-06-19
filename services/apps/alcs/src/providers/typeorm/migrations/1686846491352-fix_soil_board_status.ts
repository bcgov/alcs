import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixSoilBoardStatus1686846491352 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "alcs"."board_status" SET "order" = 3 WHERE "board_uuid" = '76fb47cf-7695-4a6e-8c71-c25a255cbcae' AND "status_code" = 'PROR';
      UPDATE "alcs"."board_status" SET "order" = 2 WHERE "board_uuid" = '76fb47cf-7695-4a6e-8c71-c25a255cbcae' AND "status_code" = 'PREP';
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
