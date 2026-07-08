import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCAndENoticeIndiRespParty1782752270796 implements MigrationInterface {
  name = 'AddCAndENoticeIndiRespParty1782752270796';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_notice" ADD "issued_to_individual_responsible_party_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_notice" ADD CONSTRAINT "FK_cb835ffe4da972cfa8a0e9f30e9" FOREIGN KEY ("issued_to_individual_responsible_party_uuid") REFERENCES "alcs"."compliance_and_enforcement_responsible_party"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_notice" DROP CONSTRAINT "FK_cb835ffe4da972cfa8a0e9f30e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_notice" DROP COLUMN "issued_to_individual_responsible_party_uuid"`,
    );
  }
}
