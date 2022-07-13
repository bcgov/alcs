import { MigrationInterface, QueryRunner } from 'typeorm';

export class healthcheck1657740956291 implements MigrationInterface {
  name = 'healthcheck1657740956291';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "health_check" ("id" SERIAL NOT NULL, "UpdateDate" bigint NOT NULL DEFAULT '1657740958413', CONSTRAINT "PK_bb6ae6b7bca4235bf4563eaeaad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "health_check" ALTER COLUMN "UpdateDate" SET DEFAULT '1657740959050'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "health_check" ALTER COLUMN "UpdateDate" SET DEFAULT '1657740958413'`,
    );
    await queryRunner.query(`DROP TABLE "health_check"`);
  }
}
