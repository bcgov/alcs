import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHideFlag1704328408031 implements MigrationInterface {
  name = 'AddHideFlag1704328408031';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "hide_from_portal" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "hide_from_portal" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "hide_from_portal"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "hide_from_portal"`,
    );
  }
}
