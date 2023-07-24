import { MigrationInterface, QueryRunner } from 'typeorm';

export class alcsSubmissionStatusColor1690214633898
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
            UPDATE "alcs"."application_submission_status_type"
            SET "alcs_background_color" = '#94c6ac',
                "alcs_color" = '#002f17'
            WHERE "code" IN ('SUBM');
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
