import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConfigTable1704411968891 implements MigrationInterface {
  name = 'AddConfigTable1704411968891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."configuration" ("name" character varying NOT NULL, "value" character varying NOT NULL, CONSTRAINT "PK_28ac27674364374c342e83cba9d" PRIMARY KEY ("name"))`,
    );

    await queryRunner.query(`
      INSERT INTO "alcs"."configuration" ("name", "value") VALUES ('portal_maintenance_mode', 'false');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "alcs"."configuration"`);
  }
}
