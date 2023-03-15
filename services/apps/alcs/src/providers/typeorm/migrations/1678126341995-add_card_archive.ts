import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCardArchive1678126341995 implements MigrationInterface {
  name = 'addCardArchive1678126341995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."card" ADD "archived" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."card"."archived" IS 'Indicates if a card was manually archived by a User'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."card"."archived" IS 'Indicates if a card was manually archived by a User'`,
    );
    await queryRunner.query(`ALTER TABLE "alcs"."card" DROP COLUMN "archived"`);
  }
}
