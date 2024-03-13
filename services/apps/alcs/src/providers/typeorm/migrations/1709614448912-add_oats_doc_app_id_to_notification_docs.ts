import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOatsDocAppIdToNotificationDocs1709614448912
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" ADD "oats_document_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" ADD "oats_application_id" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_document"."oats_document_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.notification_document.'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_document"."oats_application_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.notification_document.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_document"."oats_document_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.notification_document.'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notification_document"."oats_application_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.notification_document.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" DROP COLUMN "oats_document_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" DROP COLUMN "oats_application_id"`,
    );
  }
}
