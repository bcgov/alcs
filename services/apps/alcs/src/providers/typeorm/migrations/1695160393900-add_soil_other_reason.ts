import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSoilOtherReason1695160393900 implements MigrationInterface {
  name = 'addSoilOtherReason1695160393900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_structure_other_use_reason" text`,
    );

    await queryRunner.query(`
      INSERT INTO "alcs"."notice_of_intent_subtype"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "is_active") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Other Structure', 'OTHR', 'Other Structure', 't');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_structure_other_use_reason"`,
    );
  }
}
