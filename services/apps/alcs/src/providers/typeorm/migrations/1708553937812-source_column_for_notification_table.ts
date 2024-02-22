import { MigrationInterface, QueryRunner } from 'typeorm';

export class SourceColumnForNotificationTable1708553937812
  implements MigrationInterface
{
  name = 'SourceColumnForNotificationTable1708553937812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification" ADD "source" text NOT NULL DEFAULT 'ALCS'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification"."source" IS 'Determines where the application came from'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification"."source" IS 'Determines where the application came from'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification" DROP COLUMN "source"`,
    );
  }
}
