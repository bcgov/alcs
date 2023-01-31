import { MigrationInterface, QueryRunner } from 'typeorm';

export class adjustBoardStatuses1674082002832 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //Unlink All CEO Statuses
    await queryRunner.query(
      `DELETE FROM "alcs"."board_status" WHERE "board_uuid" = 'b3b483b6-becd-43c2-92ed-b02e1864f039'`,
    );

    //Inert New CEO Statuses
    await queryRunner.query(`
      INSERT INTO "alcs"."card_status" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'CEO Prelim Review', 'CEOP', 'App is under ceo preliminary review'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Meets&nbsp;Criteria / To&nbsp;Be&nbsp;Assigned&nbsp;to&nbsp;LUP', 'CEOR', 'App is ready to be assigne to a LUP'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Ready for CEO Review', 'CEOV', 'Application is ready for CEO Review');
    `);

    //New Soil Status
    await queryRunner.query(`
      INSERT INTO "alcs"."card_status" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Professional Report Review', 'PROR', 'App is waiting professional report review');
    `);

    //Link New Statuses to CEO Board
    await queryRunner.query(`
      INSERT INTO "alcs"."board_status" ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "order", "board_uuid", "status_code") VALUES
      ('dcc553f1-a8f9-4ecb-b68f-6cd678bd4562', NULL, NOW(), NULL, 'migration_seed', NULL, 0, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'CEOP'),
      ('704bbe1b-6c93-4e57-aad7-820ce95edb06', NULL, NOW(), NULL, 'migration_seed', NULL, 1, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'CEOR'),
      ('3f79c9e4-dc3c-4785-97e3-d3788b2ecfd0', NULL, NOW(), NULL, 'migration_seed', NULL, 2, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'PREP'),
      ('473fd62c-53b6-4073-bea9-3f9eb2389e8d', NULL, NOW(), NULL, 'migration_seed', NULL, 3, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'CEOV'),
      ('1f0c7915-6f17-4e05-9af1-6063aa5847ee', NULL, NOW(), NULL, 'migration_seed', NULL, 4, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'DRAF'),
      ('1ee31735-f354-452d-94d9-5710820288e3', NULL, NOW(), NULL, 'migration_seed', NULL, 5, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'RELE'),
      ('02f07d4e-1604-4d03-ada8-95032ee2141b', NULL, NOW(), NULL, 'migration_seed', NULL, 6, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'CNCL');
    `);

    //Set all CEO Cards to First Column
    await queryRunner.query(`
      UPDATE "alcs"."card" SET "status_code" = 'CEOP' WHERE "board_uuid" = 'b3b483b6-becd-43c2-92ed-b02e1864f039'
    `);

    //Increment Existing Soil Ranks
    await queryRunner.query(`
        UPDATE "alcs"."board_status" SET "order" = "order" + 1 WHERE "board_uuid" = '76fb47cf-7695-4a6e-8c71-c25a255cbcae' AND "order" > 1
    `);

    //Link New Status to Soil/Fill
    await queryRunner.query(`
    INSERT INTO "alcs"."board_status" ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "order", "board_uuid", "status_code") VALUES
      ('a842b9f3-3ca0-49a7-88ec-71883e837da6', NULL, NOW(), NULL, 'migration_seed', NULL, 2, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'PROR');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //Unlink Soil/Fill Status
    await queryRunner.query(`
      DELETE FROM "alcs"."board_status" WHERE "status_code" = 'PROR';
    `);

    //Decrement Existing Soil Ranks
    await queryRunner.query(`
        UPDATE "alcs"."board_status" SET "order" = "order" - 1 WHERE "board_uuid" = '76fb47cf-7695-4a6e-8c71-c25a255cbcae' AND "order" > 0
    `);

    //Delete Soil Status
    await queryRunner.query(`
      DELETE FROM "alcs"."card_status" WHERE "code" = 'PROR'
    `);

    //Delete CEO Statuses
    await queryRunner.query(`
      DELETE FROM "alcs"."card_status" WHERE "code" = 'CEOP'
    `);
    await queryRunner.query(`
      DELETE FROM "alcs"."card_status" WHERE "code" = 'CEOR'
    `);
    await queryRunner.query(`
      DELETE FROM "alcs"."card_status" WHERE "code" = 'CEOV'
    `);

    //Delete CEO Statuses
    await queryRunner.query(
      `DELETE FROM "alcs"."board_status" WHERE "board_uuid" = 'b3b483b6-becd-43c2-92ed-b02e1864f039'`,
    );

    //Link Old Statuses
    await queryRunner.query(`
    INSERT INTO "alcs"."board_status" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "uuid", "order", "board_uuid", "status_code") VALUES
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'ea12b13a-e36b-423d-8b11-6b8ed17b8fda', 0, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'INCO'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, '5fb5818b-7f07-4f25-ba3f-57077c8e8df7', 1, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'PREL'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, '013e0cc7-b113-4829-8e51-98ca2597c5d5', 2, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'PREP'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'ddddd9da-469d-44a2-af06-2745200fded7', 4, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'STAF'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, '46c410c0-ca8e-4a07-bb75-d4739246d467', 5, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'APPR'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'dcdb0bc2-7a28-40d6-a8fc-895ce6570198', 6, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'DRAF'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'fe782792-2d13-4d9e-8cd8-d470e031a31a', 7, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'DECR'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, '8ca8ecfe-fc16-4040-b4dd-c0c7aa1f4ee4', 8, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'DECS'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'eb35ecf7-1b40-4bc3-8c46-c6ad5843c672', 9, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'RELE'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, '5ec82801-8f9d-447f-aa92-8f7c59bc0d65', 10, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'CNCL');
    `);

    //Set all Cards to First Column
    await queryRunner.query(`
      UPDATE "alcs"."card" SET "status_code" = 'INCO' WHERE "board_uuid" = 'b3b483b6-becd-43c2-92ed-b02e1864f039'
    `);
  }
}
