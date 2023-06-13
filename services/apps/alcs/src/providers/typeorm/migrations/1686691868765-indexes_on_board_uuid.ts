import { MigrationInterface, QueryRunner } from 'typeorm';

export class indexesOnBoardUuid1686691868765 implements MigrationInterface {
  name = 'indexesOnBoardUuid1686691868765';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_38a14bc9166d9fac12861d07cd" ON "alcs"."card" ("board_uuid") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_38a14bc9166d9fac12861d07cd"`,
    );
  }
}
