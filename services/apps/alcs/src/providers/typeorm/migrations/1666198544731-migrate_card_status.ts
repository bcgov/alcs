import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrateCardStatus1666198544731 implements MigrationInterface {
  name = 'migrateCardStatus1666198544731';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "board_status" DROP CONSTRAINT "FK_97cd2800c2e17e3cb8c24c78987"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "FK_f3fd3dde1c00cd754841b8b696b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" DROP CONSTRAINT "UQ_3b9caa6927f2f478fa0778fd6d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_status" DROP CONSTRAINT "PK_f3fd3dde1c00cd754841b8b696b"`,
    );

    await queryRunner.query(
      `ALTER TABLE "board_status" ADD "status_code" text`,
    );
    await queryRunner.query(
      `UPDATE "board_status" SET "status_code" = "card_status".code FROM "card_status" WHERE "board_status"."status_uuid" = "card_status".uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" DROP COLUMN "status_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" ALTER COLUMN "status_code" SET NOT NULL`,
    );

    await queryRunner.query(`ALTER TABLE "card" ADD "status_code" text`);
    await queryRunner.query(
      `UPDATE "card" SET "status_code" = "card_status".code FROM "card_status" WHERE "card"."status_uuid" = "card_status".uuid`,
    );
    await queryRunner.query(`ALTER TABLE "card" DROP COLUMN "status_uuid"`);
    await queryRunner.query(
      `ALTER TABLE "card" ALTER COLUMN "status_code" SET NOT NULL`,
    );

    await queryRunner.query(`ALTER TABLE "card_status" DROP COLUMN "uuid"`);
    await queryRunner.query(
      `ALTER TABLE "card_status" ADD CONSTRAINT "PK_3e1a5a0591f4b54698ea641c38d" PRIMARY KEY ("code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_status" DROP CONSTRAINT "UQ_3e1a5a0591f4b54698ea641c38d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" ADD CONSTRAINT "UQ_cf22f0a664bdb4efafd1bce647d" UNIQUE ("board_uuid", "status_code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" ADD CONSTRAINT "FK_f7dd22f525a7b3712256f63ebcb" FOREIGN KEY ("status_code") REFERENCES "card_status"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "FK_3e1a5a0591f4b54698ea641c38d" FOREIGN KEY ("status_code") REFERENCES "card_status"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" ALTER COLUMN "status_code" SET DEFAULT 'SUBM'`,
    );
  }

  public async down(): Promise<void> {
    //Not Supported
  }
}
