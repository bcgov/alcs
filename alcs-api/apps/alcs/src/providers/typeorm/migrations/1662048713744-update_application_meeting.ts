import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateApplicationMeeting1662048713744
  implements MigrationInterface
{
  name = 'updateApplicationMeeting1662048713744';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE TABLE "application_meeting"`);
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD "description" character varying NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD "application_paused_uuid" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD CONSTRAINT "UQ_e527e6d1acc89174494456e0ad3" UNIQUE ("application_paused_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD CONSTRAINT "FK_e527e6d1acc89174494456e0ad3" FOREIGN KEY ("application_paused_uuid") REFERENCES "application_paused"("uuid") ON UPDATE CASCADE ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ALTER COLUMN "end_date" DROP NOT NULL`,
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
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP COLUMN "application_paused_uuid"`,
    );
  }
}
