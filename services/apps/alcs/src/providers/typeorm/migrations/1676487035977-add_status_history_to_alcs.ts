import { MigrationInterface, QueryRunner } from 'typeorm';

export class addStatusHistoryToAlcs1676487035977 implements MigrationInterface {
  name = 'addStatusHistoryToAlcs1676487035977';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "status_history" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."status_history" IS 'JSONB Column containing the status history of the Application from the Portal'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."status_history" IS 'JSONB Column containing the status history of the Application from the Portal'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "status_history"`,
    );
  }
}
