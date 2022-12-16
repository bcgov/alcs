import { MigrationInterface, QueryRunner } from 'typeorm';

export class addBusinessGuidUser1671209262404 implements MigrationInterface {
  name = 'addBusinessGuidUser1671209262404';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."user" ADD "bceid_business_guid" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."user" DROP COLUMN "bceid_business_guid"`,
    );
  }
}
