import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedNoiBoardStatus1685470022694 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."card_status"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'NOI Prep', 'NOIP', 'NOI is being prepared'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Ready for Presentation', 'RDYP', 'NOI is ready to be presented'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Requires ILOC or QP', 'RIOQ', 'Requires a financial bond or qualified professional oversight'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'CEO Sign-Off', 'CEOS', 'Waiting for CEO to Sign Off');
    `);

    await queryRunner.query(`
      UPDATE "alcs"."card_status" SET "label" = 'Cancelled' WHERE "code" = 'CNCL';
    `);

    await queryRunner.query(`
      INSERT INTO "alcs"."board_status"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "uuid", "order", "board_uuid", "status_code") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, '9cae13bb-5bef-4faa-bbaa-33514ab9b30d', 0, '7eb6947b-0ef0-4e0b-aa21-5195817b6261', 'INCO'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, '3c231953-aced-4de0-9800-b4d5e7eb66a2', 1, '7eb6947b-0ef0-4e0b-aa21-5195817b6261', 'NOIP'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'bd93b9b1-a015-4b07-b9c3-80ff9d710e23', 2, '7eb6947b-0ef0-4e0b-aa21-5195817b6261', 'RDYP'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, '809c8518-b629-4bc5-b58e-e49469ed3a77', 3, '7eb6947b-0ef0-4e0b-aa21-5195817b6261', 'DRAF'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, '06c58f14-d412-4c9d-92fe-d584abf53ed7', 4, '7eb6947b-0ef0-4e0b-aa21-5195817b6261', 'CEOV'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, '7cd824ac-c4f7-4a96-b58c-3653146230b6', 5, '7eb6947b-0ef0-4e0b-aa21-5195817b6261', 'CEOS'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, '46bdc0b7-eb9e-4164-a381-ee43b868a37a', 6, '7eb6947b-0ef0-4e0b-aa21-5195817b6261', 'DECR'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'b1d905af-9140-46a8-b010-9cf002d7fcbc', 7, '7eb6947b-0ef0-4e0b-aa21-5195817b6261', 'RIOQ'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'f89136d3-e63d-4111-979b-b843c64855d2', 8, '7eb6947b-0ef0-4e0b-aa21-5195817b6261', 'CNCL');
      `);
  }

  public async down(): Promise<void> {
    //
  }
}
