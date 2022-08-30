import { MigrationInterface, QueryRunner } from 'typeorm';

export class infoRequest1662161830106 implements MigrationInterface {
  name = 'infoRequest1662161830106';

  public async up(queryRunner: QueryRunner): Promise<void> {
   
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD CONSTRAINT "UQ_e527e6d1acc89174494456e0ad3" UNIQUE ("application_paused_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ALTER COLUMN "end_date" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD CONSTRAINT "FK_e527e6d1acc89174494456e0ad3" FOREIGN KEY ("application_paused_uuid") REFERENCES "application_paused"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP CONSTRAINT "FK_e527e6d1acc89174494456e0ad3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ALTER COLUMN "end_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP CONSTRAINT "UQ_e527e6d1acc89174494456e0ad3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP COLUMN "application_paused_uuid"`,
    );
  }
}
