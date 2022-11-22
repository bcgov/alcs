import { MigrationInterface, QueryRunner } from 'typeorm';

export class auditSubtask1667421301997 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO public.card_subtask_type (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"type",background_color,text_color) VALUES
      ('42c0331a-8a03-4fee-ac61-bf85339ad16f',NULL,'2022-11-02 13:39:59.844',NULL,'alcs-api',NULL,'Audit','#FEE9B5','#C08106');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // not needed
  }
}
