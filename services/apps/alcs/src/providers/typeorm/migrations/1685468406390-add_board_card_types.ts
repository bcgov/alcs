import { MigrationInterface, QueryRunner } from 'typeorm';

export class addBoardCardTypes1685468406390 implements MigrationInterface {
  name = 'addBoardCardTypes1685468406390';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."board_allowed_card_types_card_type" ("board_uuid" uuid NOT NULL, "card_type_code" text NOT NULL, CONSTRAINT "PK_97f7afcb8c494f599cda6aaf8b6" PRIMARY KEY ("board_uuid", "card_type_code"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_08dbb99476efaa2d0eed8ee1f7" ON "alcs"."board_allowed_card_types_card_type" ("board_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1a30d6083ecef1f156ff681448" ON "alcs"."board_allowed_card_types_card_type" ("card_type_code") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."board_allowed_card_types_card_type" ADD CONSTRAINT "FK_08dbb99476efaa2d0eed8ee1f7a" FOREIGN KEY ("board_uuid") REFERENCES "alcs"."board"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."board_allowed_card_types_card_type" ADD CONSTRAINT "FK_1a30d6083ecef1f156ff6814485" FOREIGN KEY ("card_type_code") REFERENCES "alcs"."card_type"("code") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."board_allowed_card_types_card_type" DROP CONSTRAINT "FK_1a30d6083ecef1f156ff6814485"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."board_allowed_card_types_card_type" DROP CONSTRAINT "FK_08dbb99476efaa2d0eed8ee1f7a"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_1a30d6083ecef1f156ff681448"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_08dbb99476efaa2d0eed8ee1f7"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."board_allowed_card_types_card_type"`,
    );
  }
}
