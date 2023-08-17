import { MigrationInterface, QueryRunner } from 'typeorm';

export class noiSourceColumn1692216006482 implements MigrationInterface {
  name = 'noiSourceColumn1692216006482';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "source" text NOT NULL DEFAULT 'ALCS'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."source" IS 'Determines where the NOI came from'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent"."source" IS 'Determines where the NOI came from'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "source"`,
    );
  }
}
