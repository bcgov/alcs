import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOatsAlrApplicationPartyToNoticeOfIntentOwner1699655237243
  implements MigrationInterface
{
  name = 'AddOatsAlrApplicationPartyToNoticeOfIntentOwner1699655237243';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_owner" ADD "oats_application_party_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_owner"."oats_application_party_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_application_parties to alcs.notice_of_intent_owner.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_owner"."oats_application_party_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_application_parties to alcs.notice_of_intent_owner.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_owner" DROP COLUMN "oats_application_party_id"`,
    );
  }
}
