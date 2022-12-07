import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAppTypeDescription1670351335481 implements MigrationInterface {
  name = 'addAppTypeDescription1670351335481';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_type" ADD "html_description" text NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_type" ADD "portal_label" text NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_type" DROP COLUMN "portal_label"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_type" DROP COLUMN "html_description"`,
    );
  }
}
