import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixIssues1663876950264 implements MigrationInterface {
  name = 'fixIssues1663876950264';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_document" DROP CONSTRAINT "FK_6c496454f95f229c63679bf191e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" ALTER COLUMN "application_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" ADD CONSTRAINT "FK_6c496454f95f229c63679bf191e" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_document" DROP CONSTRAINT "FK_6c496454f95f229c63679bf191e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD "description" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" ALTER COLUMN "application_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" ADD CONSTRAINT "FK_6c496454f95f229c63679bf191e" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
