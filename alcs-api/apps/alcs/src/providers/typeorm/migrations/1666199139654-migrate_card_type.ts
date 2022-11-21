import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrateCardType1666199139654 implements MigrationInterface {
  name = 'migrateCardType1666199139654';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "FK_5a9e11f5a58d23866e129e6981d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_type" DROP CONSTRAINT "PK_5a9e11f5a58d23866e129e6981d"`,
    );

    await queryRunner.query(
      `ALTER TABLE "card" ADD "type_code" text NOT NULL DEFAULT 'APP'`,
    );
    await queryRunner.query(
      `UPDATE "card" SET "type_code" = "card_type".code FROM "card_type" WHERE "card"."type_uuid" = "card_type".uuid`,
    );
    await queryRunner.query(`ALTER TABLE "card" DROP COLUMN "type_uuid"`);

    await queryRunner.query(`ALTER TABLE "card_type" DROP COLUMN "uuid"`);
    await queryRunner.query(
      `ALTER TABLE "card_type" ADD CONSTRAINT "PK_30b9e07ab7c729f90911604179f" PRIMARY KEY ("code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_type" DROP CONSTRAINT "UQ_30b9e07ab7c729f90911604179f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "FK_30b9e07ab7c729f90911604179f" FOREIGN KEY ("type_code") REFERENCES "card_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //Not Supported
  }
}
