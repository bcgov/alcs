import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedNoiParcelOwnerType1691705084117 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."notice_of_intent_parcel_ownership_type"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Crown', 'CRWN', 'Crown'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Fee Simple', 'SMPL', 'Fee Simple');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
