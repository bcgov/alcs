import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrateAppRegion1666201038004 implements MigrationInterface {
  name = 'migrateAppRegion1666201038004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP CONSTRAINT "FK_e527e6d1acc89174494456e0ad3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_8b7f8f8a39a6142e0f7c5ad86f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" DROP CONSTRAINT "FK_3afd8e13199baffc02bd7b0ccba"`,
    );

    await queryRunner.query(
      `ALTER TABLE "application_local_government" ADD "preferred_region_code" text`,
    );
    await queryRunner.query(
      `UPDATE "application_local_government" SET "preferred_region_code" = "application_region".code FROM "application_region" WHERE "application_local_government"."preferred_region_uuid" = "application_region".uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_local_government" DROP COLUMN "preferred_region_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_local_government" ALTER COLUMN "preferred_region_code" SET NOT NULL`,
    );

    await queryRunner.query(`ALTER TABLE "application" ADD "region_code" text`);
    await queryRunner.query(
      `UPDATE "application" SET "region_code" = "application_region".code FROM "application_region" WHERE "application"."region_uuid" = "application_region".uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "region_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "region_code" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "planning_review" ADD "region_code" text`,
    );
    await queryRunner.query(
      `UPDATE "planning_review" SET "region_code" = "application_region".code FROM "application_region" WHERE "planning_review"."region_uuid" = "application_region".uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" DROP COLUMN "region_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" ALTER COLUMN "region_code" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "application_region" DROP CONSTRAINT "PK_8b7f8f8a39a6142e0f7c5ad86f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_region" DROP COLUMN "uuid"`,
    );

    await queryRunner.query(
      `ALTER TABLE "application_region" ADD CONSTRAINT "PK_805ded031f6340b59f60b6f76f5" PRIMARY KEY ("code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_region" DROP CONSTRAINT "UQ_805ded031f6340b59f60b6f76f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_local_government" ADD CONSTRAINT "FK_b7e4525de796ada01f43f464d9d" FOREIGN KEY ("preferred_region_code") REFERENCES "application_region"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_805ded031f6340b59f60b6f76f5" FOREIGN KEY ("region_code") REFERENCES "application_region"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" ADD CONSTRAINT "FK_409473aef1f92b6675e3f7c00ad" FOREIGN KEY ("region_code") REFERENCES "application_region"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //Not Supported
  }
}
