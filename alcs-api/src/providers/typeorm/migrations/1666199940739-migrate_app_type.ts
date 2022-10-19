import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrateAppType1666199940739 implements MigrationInterface {
  name = 'migrateAppType1666199940739';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_b53229d75c2fe5a617ecbff82f3"`,
    );

    await queryRunner.query(`ALTER TABLE "application" ADD "type_code" text`);
    await queryRunner.query(
      `UPDATE "application" SET "type_code" = "application_type".code FROM "application_type" WHERE "application"."type_uuid" = "application_type".uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "type_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "type_code" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "application_type" DROP CONSTRAINT "PK_b53229d75c2fe5a617ecbff82f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_type" DROP COLUMN "uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_type" ADD CONSTRAINT "PK_c11f09867d33ab9bea127b7fa87" PRIMARY KEY ("code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_type" DROP CONSTRAINT "UQ_c11f09867d33ab9bea127b7fa87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_c11f09867d33ab9bea127b7fa87" FOREIGN KEY ("type_code") REFERENCES "application_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //Not Supported
  }
}
