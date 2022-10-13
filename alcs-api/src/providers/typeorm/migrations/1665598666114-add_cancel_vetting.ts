import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCancelVetting1665598666114 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
              INSERT INTO "public"."board_status"
          --- Add Cancelled
          ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "order", "board_uuid", "status_uuid") VALUES
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 4, 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'b11c03b2-826a-4fbe-a469-f9c5768cf2c8')`);
  }

  public async down(): Promise<void> {
    //Do we need this?
  }
}
