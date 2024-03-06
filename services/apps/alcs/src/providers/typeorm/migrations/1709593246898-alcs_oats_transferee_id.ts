import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlcsOatsTransfereeId1709593246898 implements MigrationInterface {
  name = 'AlcsOatsTransfereeId1709593246898';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_transferee" ADD "oats_alr_application_party_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_transferee"."oats_alr_application_party_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_application_parties to alcs.notification_transferee.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_transferee"."oats_alr_application_party_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_application_parties to alcs.notification_transferee.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_transferee" DROP COLUMN "oats_alr_application_party_id"`,
    );
  }
}
