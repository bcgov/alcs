import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOatsPersonOrganizationIdToNoiOwner1699547676891
  implements MigrationInterface
{
  name = 'AddOatsPersonOrganizationIdToNoiOwner1699547676891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_owner" ADD "oats_person_organization_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_owner"."oats_person_organization_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_person_organization to alcs.notice_of_intent_owner. Note that this id is unique only in scope of parcel.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_owner"."oats_person_organization_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_person_organization to alcs.notice_of_intent_owner. Note that this id is unique only in scope of parcel.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_owner" DROP COLUMN "oats_person_organization_id"`,
    );
  }
}
