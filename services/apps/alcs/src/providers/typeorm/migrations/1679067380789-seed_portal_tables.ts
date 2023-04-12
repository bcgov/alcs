import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedPortalTables1679067380789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."application_status" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Cancelled', 'CANC', 'Application has been cancelled by the applicant'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'In Progress', 'PROG', 'Application is in progress and has not been submitted'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Submitted to ALC', 'SUBM', 'Application has been submitted'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Submitted to L/FNG', 'SUBG', 'Application is ready to be reviewed by L/FNG'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Under Review by L/FNG', 'REVW', 'Application is currently being reviewed by L/FNG'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'L/FNG Refused to Forward', 'REFU', 'Application was reviewed and refused by L/FNG'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Wrong L/FNG', 'WRNG', 'Application was sent to wrong L/FNG and has been returned'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'L/FNG Returned as Incomplete', 'INCM', 'L/FNG reviewed application and sent it back as incomplete');
      `);

    await queryRunner.query(`
      INSERT INTO "alcs"."application_owner_type" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Individual', 'INDV', 'Individual'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Organization', 'ORGZ', 'Organization'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Agent', 'AGEN', 'Agent'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Crown', 'CRWN', 'Crown');
    `);

    await queryRunner.query(`
      INSERT INTO "alcs"."application_parcel_ownership_type" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Fee Simple', 'SMPL', 'Fee Simple'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Crown', 'CRWN', 'Crown');
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE from "alcs"."application_status"');
    await queryRunner.query('DELETE from "alcs"."application_owner_type"');
    await queryRunner.query(
      'DELETE from "alcs"."application_parcel_ownership_type"',
    );
  }
}
