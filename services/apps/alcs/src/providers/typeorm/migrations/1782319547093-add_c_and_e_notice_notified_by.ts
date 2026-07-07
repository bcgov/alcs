import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCAndENoticeNotifiedBy1782319547093 implements MigrationInterface {
  name = 'AddCAndENoticeNotifiedBy1782319547093';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_notice" ADD "notifications" jsonb NOT NULL DEFAULT '[]'::jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_notice" DROP COLUMN "notifications"`);
  }
}
