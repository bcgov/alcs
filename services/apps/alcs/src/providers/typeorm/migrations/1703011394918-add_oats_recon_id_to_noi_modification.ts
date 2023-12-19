import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOatsReconIdToNoiModification1703011394918
  implements MigrationInterface
{
  name = 'AddOatsReconIdToNoiModification1703011394918';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" ADD "oats_reconsideration_request_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_modification"."oats_reconsideration_request_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_reconsideration_requests to alcs.notice_of_intent_modification.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_modification"."oats_reconsideration_request_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_reconsideration_requests to alcs.notice_of_intent_modification.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" DROP COLUMN "oats_reconsideration_request_id"`,
    );
  }
}
