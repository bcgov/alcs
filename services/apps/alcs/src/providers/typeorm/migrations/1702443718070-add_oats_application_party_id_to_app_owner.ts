import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOatsApplicationPartyIdToAppOwner1702443718070
  implements MigrationInterface
{
  name = 'AddOatsApplicationPartyIdToAppOwner1702443718070';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD "oats_application_party_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_owner"."oats_application_party_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_application_parties to alcs.application_owner.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_owner"."oats_application_party_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_application_parties to alcs.application_owner.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP COLUMN "oats_application_party_id"`,
    );
  }
}
