import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPlanningReviewsV21709663586391 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //Statuses
    await queryRunner.query(`
      INSERT INTO "alcs"."planning_review_type" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "short_label", "background_color", "text_color", "html_description") VALUES
        (NULL, NOW(), NULL, 'migration-seed', NULL, 'Agricultural Area Plan', 'AAPP', 'Agricultural Area Plan', 'AAP', '#F5B8BA', '#313132', DEFAULT),
        (NULL, NOW(), NULL, 'migration-seed', NULL, 'Misc Studies and Projects', 'MISC', 'Misc Studies and Projects', 'MISC', '#C8FCFC', '#313132', DEFAULT),
        (NULL, NOW(), NULL, 'migration-seed', NULL, 'L/FNG Boundary Adjustment', 'BAPP', 'L/FNG Boundary Adjustment', 'BA', '#FFDBE3', '#313132', DEFAULT),
        (NULL, NOW(), NULL, 'migration-seed', NULL, 'ALR Boundary', 'ALRB', 'ALR Boundary', 'ALRB', '#BDDCBD', '#313132', DEFAULT),
        (NULL, NOW(), NULL, 'migration-seed', NULL, 'Regional Growth Strategy', 'RGSP', 'Regional Growth Strategy', 'RGS', '#FFE1B3', '#313132', DEFAULT),
        (NULL, NOW(), NULL, 'migration-seed', NULL, 'Crown Land Use Plan', 'CLUP', 'Crown Land Use Plan', 'CLUP', '#B5C7E1', '#313132', DEFAULT),
        (NULL, NOW(), NULL, 'migration-seed', NULL, 'Official Community Plan', 'OCPP', 'Official Community Plan', 'OCP', '#FFF9C5', '#313132', DEFAULT),
        (NULL, NOW(), NULL, 'migration-seed', NULL, 'Transportation Plan', 'TPPP', 'Transportation Plan', 'TP', '#EDC0F5', '#313132', DEFAULT),
        (NULL, NOW(), NULL, 'migration-seed', NULL, 'Utility/Energy Planning', 'UEPP', 'Utility/Energy Planning', 'UEP', '#E1F8C7', '#313132', DEFAULT),
        (NULL, NOW(), NULL, 'migration-seed', NULL, 'Zoning Bylaw', 'ZBPP', 'Zoning Bylaw', 'ZB', '#B5D5E0', '#313132', DEFAULT),
        (NULL, NOW(), NULL, 'migration-seed', NULL, 'Parks Planning', 'PARK', 'Parks Planning', 'PARK', '#C8E0FD', '#313132', DEFAULT);
      `);

    //New Board
    await queryRunner.query(`
      INSERT INTO "alcs"."board" 
        ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "code", "title", "show_on_schedule") VALUES
        ('e7b18852-4f8f-419e-83e3-60e706b4a494', NULL, NOW(), NULL, 'migration_seed', NULL, 'rppp', 'Regional Planning', 'f');
    `);

    //Allow Planning Cards on new board
    await queryRunner.query(`
      INSERT INTO "alcs"."board_allowed_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('e7b18852-4f8f-419e-83e3-60e706b4a494', 'PLAN');
    `);

    //Remove from Vetting
    await queryRunner.query(`
      DELETE FROM "alcs"."board_allowed_card_types_card_type" WHERE ("board_uuid" = 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2' AND "card_type_code" = 'PLAN');
    `);

    //Change creation from Executive Committee to Regional Planning Board
    await queryRunner.query(`
      DELETE FROM "alcs"."board_create_card_types_card_type" WHERE ("board_uuid" = 'd8c18278-cb41-474e-a180-534a101243ab' AND "card_type_code" = 'PLAN');
    `);

    await queryRunner.query(`
      INSERT INTO "alcs"."board_create_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('e7b18852-4f8f-419e-83e3-60e706b4a494', 'PLAN');
    `);

    //Add column to board
    await queryRunner.query(`
      INSERT INTO "alcs"."board_status" 
        ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "order", "board_uuid", "status_code") VALUES
        ('6560aaec-9b9d-4ad6-9b8b-ccf2ce384b69', NULL, NOW(), NULL, 'migration_seed', NULL, 0, 'e7b18852-4f8f-419e-83e3-60e706b4a494', 'SUBM');
    `);
  }

  public async down(): Promise<void> {
    //Nope
  }
}
