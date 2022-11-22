import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrateReconType1666196545810 implements MigrationInterface {
  name = 'migrateReconType1666196545810';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_reconsideration" DROP CONSTRAINT "FK_38dd9eddb8d8d72e50d28e876e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_reconsideration_type" DROP CONSTRAINT "PK_2ffcd94d8574e04dc112b07cee7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_reconsideration" ADD "type_code" text`,
    );
    await queryRunner.query(
      `UPDATE "application_reconsideration" SET "type_code" = "application_reconsideration_type".code FROM "application_reconsideration_type" WHERE "application_reconsideration"."type_uuid" = "application_reconsideration_type".uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_reconsideration" DROP COLUMN "type_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_reconsideration_type" DROP COLUMN "uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_reconsideration_type" ADD CONSTRAINT "PK_8cc8462c63cbb9608a920e9edde" PRIMARY KEY ("code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_reconsideration_type" DROP CONSTRAINT "UQ_d141dda7d1d0d9b59629557827e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_reconsideration" ADD CONSTRAINT "FK_8cc8462c63cbb9608a920e9edde" FOREIGN KEY ("type_code") REFERENCES "application_reconsideration_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_reconsideration" ALTER COLUMN "type_code" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //No can do!
  }
}
