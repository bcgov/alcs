import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixNoiBoard1685747376721 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "alcs"."board_status" SET "status_code" = 'RELE' WHERE "uuid" = '46bdc0b7-eb9e-4164-a381-ee43b868a37a';
    `);

    await queryRunner.query(`
      INSERT INTO "alcs"."card_status"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Incoming / Prelim Review', 'INPR', 'New created and waiting preliminary review');
    `);

    await queryRunner.query(`
      UPDATE "alcs"."board_status" SET "status_code" = 'INPR' WHERE "uuid" = '9cae13bb-5bef-4faa-bbaa-33514ab9b30d';
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
