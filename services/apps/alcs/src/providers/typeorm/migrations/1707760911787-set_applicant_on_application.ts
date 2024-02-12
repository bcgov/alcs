import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetApplicantOnApplication1707760911787
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE alcs.application 
        SET applicant = application_submission.applicant
        FROM alcs.application_submission 
        WHERE alcs.application.file_number = alcs.application_submission.file_number;
    `);
  }

  public async down(): Promise<void> {
    // no
  }
}
