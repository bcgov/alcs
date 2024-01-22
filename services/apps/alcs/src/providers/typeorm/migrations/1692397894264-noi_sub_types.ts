import { MigrationInterface, QueryRunner } from 'typeorm';

export class noiSubTypes1692397894264 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    INSERT INTO "alcs"."notice_of_intent_subtype"
      ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
      (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Area-Wide Filling', 'ARWF', 'Area-Wide Filling'),
      (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Placer Mining', 'PLMI', 'Placer Mining'),
      (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Aggregate Extraction or Placer Mining', 'AEPM', 'Aggregate Extraction or Placer Mining'),
      (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Farm Structure', 'FRST', 'Farm Structure');
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //nope
  }
}
