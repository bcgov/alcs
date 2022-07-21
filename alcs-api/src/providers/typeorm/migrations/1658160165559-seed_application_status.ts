import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedApplicationStatus1658160165559 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO public.application_status (uuid,"audit_deleted_date_at","audit_created_at","audit_updated_at", audit_created_by,code,description) VALUES
    ('46235264-9529-4e52-9c2d-6ed2b8b9edb8',NULL,now(),NULL,'migration_seed', 'TODO','default application status');`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `delete from public.application_status where uuid = '46235264-9529-4e52-9c2d-6ed2b8b9edb8'`,
    );
  }
}
