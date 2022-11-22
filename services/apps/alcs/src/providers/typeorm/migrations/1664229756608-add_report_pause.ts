import { MigrationInterface, QueryRunner } from 'typeorm';

export class addReportPause1664229756608 implements MigrationInterface {
  name = 'addReportPause1664229756608';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_meeting" RENAME COLUMN "application_paused_uuid" TO "meeting_pause_uuid";`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD "report_pause_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD CONSTRAINT "UQ_77fa445c8781553d4ebd7a15749" UNIQUE ("report_pause_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD CONSTRAINT "FK_77fa445c8781553d4ebd7a15749" FOREIGN KEY ("report_pause_uuid") REFERENCES "application_paused"("uuid") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP CONSTRAINT "FK_77fa445c8781553d4ebd7a15749"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP CONSTRAINT "UQ_77fa445c8781553d4ebd7a15749"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP COLUMN "report_pause_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" RENAME COLUMN "meeting_pause_uuid" TO "application_paused_uuid";`,
    );
  }
}
