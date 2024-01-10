import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeCarduuidNullableForAppReconAddOatsReconId1704480768243
  implements MigrationInterface
{
  name = 'MakeCarduuidNullableForAppReconAddOatsReconId1704480768243';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ADD "oats_reconsideration_request_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_reconsideration"."oats_reconsideration_request_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_reconsideration_requests to alcs.application_reconsideration.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" DROP CONSTRAINT "FK_6d10e08b482effb968defe55357"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ALTER COLUMN "card_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ADD CONSTRAINT "FK_6d10e08b482effb968defe55357" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" DROP CONSTRAINT "FK_6d10e08b482effb968defe55357"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ALTER COLUMN "card_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ADD CONSTRAINT "FK_6d10e08b482effb968defe55357" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_reconsideration"."oats_reconsideration_request_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_reconsideration_requests to alcs.application_reconsideration.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" DROP COLUMN "oats_reconsideration_request_id"`,
    );
  }
}
