import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrateMeetingType1666199589836 implements MigrationInterface {
  name = 'migrateMeetingType1666199589836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP CONSTRAINT "FK_72a475306937f870cdffdcc0981"`,
    );

    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD "type_code" text`,
    );
    await queryRunner.query(
      `UPDATE "application_meeting" SET "type_code" = "application_meeting_type".code FROM "application_meeting_type" WHERE "application_meeting"."type_uuid" = "application_meeting_type".uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP COLUMN "type_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ALTER COLUMN "type_code" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "application_meeting_type" DROP CONSTRAINT "PK_72a475306937f870cdffdcc0981"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting_type" DROP COLUMN "uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting_type" ADD CONSTRAINT "PK_85b30b748ea5fd08763e0ecf628" PRIMARY KEY ("code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting_type" DROP CONSTRAINT "UQ_85b30b748ea5fd08763e0ecf628"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD CONSTRAINT "FK_85b30b748ea5fd08763e0ecf628" FOREIGN KEY ("type_code") REFERENCES "application_meeting_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //Not Supported
  }
}
