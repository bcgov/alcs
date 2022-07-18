import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedApplicationStatus1658160165559 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO public.application_status (id,"auditDeletedDateAt","auditCreatedAt","auditUpdatedAt",code,description) VALUES
        ('46235264-9529-4e52-9c2d-6ed2b8b9edb8',NULL,1658160165559,NULL,'TODO','default application status');`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `delete from public.application_status where id = '46235264-9529-4e52-9c2d-6ed2b8b9edb8'`,
    );
  }
}
