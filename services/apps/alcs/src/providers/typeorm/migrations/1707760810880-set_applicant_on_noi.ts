import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetApplicantOnNoi1707760810880 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE alcs.notice_of_intent 
        SET applicant = notice_of_intent_submission.applicant
        FROM alcs.notice_of_intent_submission 
        WHERE alcs.notice_of_intent.file_number = alcs.notice_of_intent_submission.file_number;
    `);
  }

  public async down(): Promise<void> {
    // no
  }
}
