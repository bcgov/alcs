import { MigrationInterface, QueryRunner } from 'typeorm';

export class addReturnedReviewStatuses1674077368572
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "portal"."application_status" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Wrong L/FNG', 'WRNG', 'Application was sent to wrong L/FNG and has been returned'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'L/FNG Returned as Incomplete', 'INCM', 'L/FNG reviewed application and sent it back as incomplete');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "portal"."application_status" WHERE "code" = 'WRNG'
    `);
    await queryRunner.query(`
      DELETE FROM "portal"."application_status" WHERE "code" = 'INCM'
    `);
  }
}
