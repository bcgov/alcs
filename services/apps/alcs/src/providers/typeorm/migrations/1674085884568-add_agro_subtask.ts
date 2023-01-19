import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAgroSubtask1674085884568 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "alcs"."card_subtask_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "background_color", "text_color") VALUES
            (NULL, NOW(), NULL, 'migration_seed', NULL, 'Agrologist', 'AGRO', 'Agrologist', '#94C6AC', '#002F17');
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
