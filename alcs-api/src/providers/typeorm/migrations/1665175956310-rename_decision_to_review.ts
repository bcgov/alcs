import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameDecisionToReview1665175956310 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        UPDATE public."card_status" SET "label" ='Ready&nbsp;for&nbsp;Review&nbsp;Sent / Going&nbsp;to&nbsp;Next&nbsp;Review&nbsp;Meeting' WHERE "uuid" = '64944bb8-f2f2-4709-9062-214f5c4d3187'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        UPDATE public."card_status" SET "label" ='Ready for Review Sent / Going to Next Decision Meeting' WHERE "uuid" = '64944bb8-f2f2-4709-9062-214f5c4d3187'
    `);
  }
}
