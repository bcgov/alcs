import { MigrationInterface, QueryRunner } from 'typeorm';

export class nullablePause1663886615921 implements MigrationInterface {
  name = 'nullablePause1663886615921';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP CONSTRAINT "FK_e527e6d1acc89174494456e0ad3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ALTER COLUMN "application_paused_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD CONSTRAINT "FK_e527e6d1acc89174494456e0ad3" FOREIGN KEY ("application_paused_uuid") REFERENCES "application_paused"("uuid") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP CONSTRAINT "FK_e527e6d1acc89174494456e0ad3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ALTER COLUMN "application_paused_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD CONSTRAINT "FK_e527e6d1acc89174494456e0ad3" FOREIGN KEY ("application_paused_uuid") REFERENCES "application_paused"("uuid") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }
}
