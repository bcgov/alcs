import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeUserUniques1666817518180 implements MigrationInterface {
  name = 'changeUserUniques1666817518180';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_9b4bff420dc831713caf962716" ON "user" ("idir_user_guid") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_298a928993eee3de03067af610" ON "user" ("bceid_guid") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_298a928993eee3de03067af610"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9b4bff420dc831713caf962716"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`,
    );
  }
}
