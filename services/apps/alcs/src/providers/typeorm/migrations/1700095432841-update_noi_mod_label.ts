import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNoiModLabel1700095432841 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "alcs"."card_type" SET "label" = 'NOI Modification' WHERE "code" = 'NOIM'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Nope
  }
}
