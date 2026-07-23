import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCAndENoticeDirector1782756572207 implements MigrationInterface {
  name = 'AddCAndENoticeDirector1782756572207';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_notice" ADD "issued_to_director_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_notice" ADD CONSTRAINT "FK_a3f20d4ae096798ad451484ffa9" FOREIGN KEY ("issued_to_director_uuid") REFERENCES "alcs"."compliance_and_enforcement_responsible_party_director"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_notice" DROP CONSTRAINT "FK_a3f20d4ae096798ad451484ffa9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_notice" DROP COLUMN "issued_to_director_uuid"`,
    );
  }
}
