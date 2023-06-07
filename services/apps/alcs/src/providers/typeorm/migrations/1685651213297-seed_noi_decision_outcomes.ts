import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedNoiDecisionOutcomes1685651213297
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."notice_of_intent_decision_outcome"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "is_first_decision") VALUES
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Approved', 'APPR', 'NOI was Approved', 't'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Ordered not to Proceed', 'ONTP', 'Applicant has been ordered not to proceed', 't'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Proceeded over 60 Days', 'PO6D', 'NOI exceeded the 60 day deadline', 't');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //Do we need this?
  }
}
