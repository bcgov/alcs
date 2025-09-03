import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddComplaintDocType1752168876435 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO alcs.document_code (audit_created_by, label, code, description, oats_code)
      VALUES ('migration_seed', 'Complaint', 'CMPL', 'Complaint or referral submission document', 'CMPL')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
