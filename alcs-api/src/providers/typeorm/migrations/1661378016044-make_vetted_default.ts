import { MigrationInterface, QueryRunner } from 'typeorm';

export class makeVettedDefault1661378016044 implements MigrationInterface {
  name = 'makeVettedDefault1661378016044';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_5b6c6dffed9d8dd24903be05473"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_fe6c9e8b98e3f649b598710dfce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "status_uuid" SET DEFAULT 'f9f4244f-9741-45f0-9724-ce13e8aa09eb'`,
    );
    await queryRunner.query(
      `UPDATE "application" SET "board_uuid" = 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2'`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "board_uuid" SET DEFAULT 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2'`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "board_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_5b6c6dffed9d8dd24903be05473" FOREIGN KEY ("status_uuid") REFERENCES "application_status"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_fe6c9e8b98e3f649b598710dfce" FOREIGN KEY ("board_uuid") REFERENCES "board"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_fe6c9e8b98e3f649b598710dfce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_5b6c6dffed9d8dd24903be05473"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "board_uuid" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "board_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "status_uuid" SET DEFAULT 'e6ddd1af-1cb9-4e45-962a-92e8d532b149'`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_fe6c9e8b98e3f649b598710dfce" FOREIGN KEY ("board_uuid") REFERENCES "board"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_5b6c6dffed9d8dd24903be05473" FOREIGN KEY ("status_uuid") REFERENCES "application_status"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
