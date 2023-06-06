import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoiModiCardType1685996275296 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."card_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "portal_html_description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Modification', 'NOIM', 'NOI Modification type card', DEFAULT);
    `);

    await queryRunner.query(`
      INSERT INTO "alcs"."board_allowed_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'NOIM'),
        ('7eb6947b-0ef0-4e0b-aa21-5195817b6261', 'NOIM');
    `);
  }

  public async down(): Promise<void> {
    //NO
  }
}
