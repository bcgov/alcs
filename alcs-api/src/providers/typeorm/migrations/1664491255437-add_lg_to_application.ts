import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLgToApplication1664491255437 implements MigrationInterface {
  name = 'addLgToApplication1664491255437';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" ADD "local_government_uuid" uuid NOT NULL DEFAULT '001cfdad-bc6e-4d25-9294-1550603da980'`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_58853fcb8957e8b2c131cc12da1" FOREIGN KEY ("local_government_uuid") REFERENCES "application_local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "local_government_uuid" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_58853fcb8957e8b2c131cc12da1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "local_government_uuid"`,
    );
  }
}
