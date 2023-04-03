import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameLgSource1680280060590 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "alcs"."document" SET "source"='L/FNG' WHERE "source"='Local Government'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
