import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrateCardHistory1666203063071 implements MigrationInterface {
  name = 'migrateCardHistory1666203063071';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "card_history"`);
    await queryRunner.query(
      `ALTER TABLE "card_history" DROP COLUMN "status_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_history" ADD "status_code" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "card_history"`);
    await queryRunner.query(
      `ALTER TABLE "card_history" DROP COLUMN "status_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_history" ADD "status_uuid" uuid NOT NULL`,
    );
  }
}
