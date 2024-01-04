import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOatsIdToApplicationModification1704394923698
  implements MigrationInterface
{
  name = 'AddOatsIdToApplicationModification1704394923698';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" ADD "oats_reconsideration_request_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_modification"."oats_reconsideration_request_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_reconsideration_requests to alcs.application_modification.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_modification"."oats_reconsideration_request_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_reconsideration_requests to alcs.application_modification.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" DROP COLUMN "oats_reconsideration_request_id"`,
    );
  }
}
