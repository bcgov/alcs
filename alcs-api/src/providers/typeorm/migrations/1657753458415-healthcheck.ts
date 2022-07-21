import { MigrationInterface, QueryRunner } from 'typeorm';

export class healthcheck1657753458415 implements MigrationInterface {
  name = 'healthcheck1657753458415';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "health_check" ("id" SERIAL NOT NULL, "update_date" bigint NOT NULL DEFAULT '1657753460650', CONSTRAINT "PK_bb6ae6b7bca4235bf4563eaeaad" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "health_check"`);
  }
}
