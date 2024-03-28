import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteV1Covenant1710800257994 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "alcs"."covenant";
    `);
    await queryRunner.query(`
      UPDATE "alcs"."card" SET "audit_deleted_date_at" = NOW(), "archived" = TRUE WHERE "type_code" = 'COVE'
    `);
  }

  public async down(): Promise<void> {}
}
