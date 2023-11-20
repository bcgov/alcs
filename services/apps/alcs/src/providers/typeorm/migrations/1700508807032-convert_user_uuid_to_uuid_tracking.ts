import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertUserUuidToUuidTracking1700508807032
  implements MigrationInterface
{
  name = 'ConvertUserUuidToUuidTracking1700508807032';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE TABLE "alcs"."file_viewed"`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."file_viewed" DROP COLUMN "user_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."file_viewed" ADD "user_uuid" uuid NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE TABLE "alcs"."file_viewed"`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."file_viewed" DROP COLUMN "user_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."file_viewed" ADD "user_uuid" character varying NOT NULL`,
    );
  }
}
