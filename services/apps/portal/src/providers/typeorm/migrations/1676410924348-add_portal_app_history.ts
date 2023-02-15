import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPortalAppHistory1676410924348 implements MigrationInterface {
  name = 'addPortalAppHistory1676410924348';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "status_history" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."status_history" IS 'JSONB Column containing the status history of the Application'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."status_history" IS 'JSONB Column containing the status history of the Application'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "status_history"`,
    );
  }
}
