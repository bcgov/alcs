import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAmendmentCardType1666891474849 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      INSERT INTO card_type (audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"label",code,description) VALUES
	    (NULL,NOW(),NULL,'migration_seed',NULL,'Amendment','AMEND','Amendment type card');
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      DELETE FROM card_type WHERE uuid = '6920ba0a-dfca-4489-8041-0bc07eebf78b';
      `,
    );
  }
}
