import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEtlMissedDeletingLfgnReviews1730144741773
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        delete from alcs.application_submission_review asr
        where       asr.application_file_number in ('61301', '67497')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
