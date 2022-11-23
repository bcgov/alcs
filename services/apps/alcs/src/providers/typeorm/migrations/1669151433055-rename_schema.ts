import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameSchema1669151433055 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER SCHEMA "public" RENAME TO "alcs"`);
    await queryRunner.query(`CREATE SCHEMA "public";`);
    await queryRunner.query(`CREATE TABLE "public"."migrations" (
        id serial4 NOT NULL,
        "timestamp" int8 NOT NULL,
        "name" varchar NOT NULL,
        CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id)
    ); `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // does not worth it
  }
}
