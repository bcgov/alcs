import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPinIndex1675291785788 implements MigrationInterface {
  name = 'addPinIndex1675291785788';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_930d5ab7b370ca6f8ab246f932" ON "portal"."parcel_lookup" ("pin") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "portal"."IDX_930d5ab7b370ca6f8ab246f932"`,
    );
  }
}
