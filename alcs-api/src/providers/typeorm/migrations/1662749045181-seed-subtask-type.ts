import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedSubtaskType1662749045181 implements MigrationInterface {
  name = 'seedSubtaskType1662749045181';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "public"."application_subtask_type" 
        ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "type", "background_color", "text_color") VALUES
        ('f5bef372-0adf-4ac6-adea-a9316529b534', NULL, '2022-09-09 19:14:23.334337+00', '2022-09-09 19:14:23.334337+00', 'alcs-api', NULL, 'GIS', '#A7C7E8', '#002447');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "application_subtask_type"`);
  }
}
