import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContraintToPrDocs1712090189047 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE alcs.planning_review_document ADD CONSTRAINT unique_oats_ids UNIQUE(oats_document_id, oats_planning_review_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_document" DROP CONSTRAINT unique_oats_ids`,
    );
  }
}
