import { MigrationInterface, QueryRunner } from 'typeorm';

export class addApplicationSubmissionStatuses1683155016962
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` INSERT INTO "alcs"."application_status" 
      ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'ALC Decision', 'ALCD', 'ALC has released decision'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'CEO Decision', 'CEOD', 'ALC has released decision on behalf CEO');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
