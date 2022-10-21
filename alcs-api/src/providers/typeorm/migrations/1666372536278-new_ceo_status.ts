import { MigrationInterface, QueryRunner } from 'typeorm';

export class newCeoStatus1666372536278 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //Create new Statuses
    queryRunner.query(`
        INSERT INTO "public"."card_status" 
            ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
            (NULL, '2022-10-21 17:15:01.223508+00', NULL, 'migration_seed', NULL, 'Decision Signed-off', 'DECS', 'CEO Board only, decision is reviewed and signed off'),
            (NULL, '2022-10-21 17:15:01.223508+00', NULL, 'migration_seed', NULL, 'Decision Review', 'DECR', 'CEO Board only, decision is ready for review'),
            (NULL, '2022-10-21 17:15:01.223508+00', NULL, 'migration_seed', NULL, 'Application Ready for Review', 'APPR', 'CEO Board Only, application is ready for review');
    `);

    //Clear cards in old status
    queryRunner.query(
      `UPDATE "card" SET status_code = 'INCO' WHERE board_uuid = 'b3b483b6-becd-43c2-92ed-b02e1864f039' AND status_code = ANY('{MEET, READ, MANA, PEND}') ;`,
    );

    //Delete old status from CEO Board
    queryRunner.query(
      `DELETE FROM board_status WHERE board_uuid = 'b3b483b6-becd-43c2-92ed-b02e1864f039' AND status_code = ANY('{MEET, READ, MANA, PEND}');`,
    );

    //Link new statuses
    queryRunner.query(
      `
        INSERT INTO "public"."board_status"
          ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "order", "board_uuid", "status_code") VALUES
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 5, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'APPR'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 7, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'DECR'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 8, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'DECS');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
