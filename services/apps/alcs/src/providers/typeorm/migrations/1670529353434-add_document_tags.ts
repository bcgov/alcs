import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDocumentTags1670529353434 implements MigrationInterface {
  name = 'addDocumentTags1670529353434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ADD "tags" text array NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "alcs"."document" DROP COLUMN "tags"`);
  }
}
