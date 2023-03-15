import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCrownOwner1677866906022 implements MigrationInterface {
  name = 'addCrownOwner1677866906022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "portal"."application_owner_type" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Crown', 'CRWN', 'Crown');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "portal"."application_owner_type" WHERE "code" = 'CRWN');`,
    );
  }
}
