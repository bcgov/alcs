import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationUniqueExclusion1709615421151
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" ADD CONSTRAINT unique_doc_app_id UNIQUE (oats_document_id, oats_application_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_document" DROP CONSTRAINT unique_doc_app_id UNIQUE (oats_document_id, oats_application_id)`,
    );
  }
}
