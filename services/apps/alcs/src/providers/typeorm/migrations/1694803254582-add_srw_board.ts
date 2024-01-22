import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSrwBoard1694803254582 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."board"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "uuid", "code", "title", "show_on_schedule") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, '0e880b15-4253-4968-bc0c-61239df1d0b8', 'noti', 'Notification of SRWs', 'f');
    `);

    await queryRunner.query(`
      INSERT INTO "alcs"."board_allowed_card_types_card_type" ("board_uuid", "card_type_code") VALUES
       ('0e880b15-4253-4968-bc0c-61239df1d0b8', 'NOTI');
    `);

    //Create New Statuses
    await queryRunner.query(`
      INSERT INTO "alcs"."card_status"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Received', 'RECI', 'Submission has been receieved'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Requires Audit', 'REQA', 'Submission requires an audit'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Completed', 'COMP', 'All steps completed');
    `);

    await queryRunner.query(`
      INSERT INTO "alcs"."board_status"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "uuid", "order", "board_uuid", "status_code") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'f4554c54-183b-46bc-8ba3-26705bd8e56c', 0, '0e880b15-4253-4968-bc0c-61239df1d0b8', 'RECI'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'bb82745c-d00b-4bc9-86dc-5824c86e23d5', 1, '0e880b15-4253-4968-bc0c-61239df1d0b8', 'REQA'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, '1aa8267b-3d75-4ac8-9505-044e28dff210', 2, '0e880b15-4253-4968-bc0c-61239df1d0b8', 'COMP'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, '6f234cb3-0022-4b92-96b6-3418ad27299e', 3, '0e880b15-4253-4968-bc0c-61239df1d0b8', 'CNCL');
    `);
  }

  public async down(): Promise<void> {
    //Nope
  }
}
