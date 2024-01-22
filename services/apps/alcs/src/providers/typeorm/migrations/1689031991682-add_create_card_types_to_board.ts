import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCreateCardTypesToBoard1689031991682
  implements MigrationInterface
{
  name = 'addCreateCardTypesToBoard1689031991682';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."board_create_card_types_card_type" ("board_uuid" uuid NOT NULL, "card_type_code" text NOT NULL, CONSTRAINT "PK_4a9535896f19ec7870e6e376bf8" PRIMARY KEY ("board_uuid", "card_type_code"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6bab6507fdfd4c78ad0c0ef795" ON "alcs"."board_create_card_types_card_type" ("board_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0539f751e12ae24da450a36a1e" ON "alcs"."board_create_card_types_card_type" ("card_type_code") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."board_create_card_types_card_type" ADD CONSTRAINT "FK_6bab6507fdfd4c78ad0c0ef795c" FOREIGN KEY ("board_uuid") REFERENCES "alcs"."board"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."board_create_card_types_card_type" ADD CONSTRAINT "FK_0539f751e12ae24da450a36a1e5" FOREIGN KEY ("card_type_code") REFERENCES "alcs"."card_type"("code") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."board_create_card_types_card_type" DROP CONSTRAINT "FK_0539f751e12ae24da450a36a1e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."board_create_card_types_card_type" DROP CONSTRAINT "FK_6bab6507fdfd4c78ad0c0ef795c"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_0539f751e12ae24da450a36a1e"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_6bab6507fdfd4c78ad0c0ef795"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."board_create_card_types_card_type"`,
    );
  }
}
