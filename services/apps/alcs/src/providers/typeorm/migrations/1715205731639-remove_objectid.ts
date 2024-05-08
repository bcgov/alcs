import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveObjectid1715205731639 implements MigrationInterface {
  name = 'RemoveObjectid1715205731639';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."parcel_lookup" DROP COLUMN "objectid"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."parcel_lookup" ADD "objectid" integer NOT NULL`,
    );
  }
}
