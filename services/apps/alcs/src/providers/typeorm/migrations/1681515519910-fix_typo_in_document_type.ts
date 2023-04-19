import { MigrationInterface, QueryRunner } from 'typeorm';

export class oatsDocumentsImportPreparation1681515519910
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // fix code value in ALCS

    await queryRunner.query(
      `ALTER TABLE alcs.application_document_code DROP CONSTRAINT "UQ_dae191d1246f18def0a58114ce6";`,
    );

    await queryRunner.query(`
      insert into "alcs"."application_document_code"
      ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "oats_code") VALUES
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Acknowledgement Letter', 'ACKL', 'Letter acknowledging some input from Applicant', 'ACK');
    `);

    await queryRunner.query(`
      update "alcs"."application_document"
      set type_code = 'ACKL'
      where type_code = 'ACK';
    `);

    await queryRunner.query(`
      delete from "alcs"."application_document_code"
      where code = 'ACK'
    `);

    await queryRunner.query(
      `ALTER TABLE alcs.application_document_code ADD CONSTRAINT "UQ_dae191d1246f18def0a58114ce6" UNIQUE (description);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // no
  }
}
