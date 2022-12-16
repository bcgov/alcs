import { MigrationInterface, QueryRunner } from 'typeorm';

export class addBusinessGuid1671209228391 implements MigrationInterface {
  name = 'addBusinessGuid1671209228391';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_local_government" ADD "bceid_business_guid" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_local_government" ADD CONSTRAINT "UQ_412d09fb58f6c110625af6b4136" UNIQUE ("bceid_business_guid")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_local_government" DROP CONSTRAINT "UQ_412d09fb58f6c110625af6b4136"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_local_government" DROP COLUMN "bceid_business_guid"`,
    );
  }
}
