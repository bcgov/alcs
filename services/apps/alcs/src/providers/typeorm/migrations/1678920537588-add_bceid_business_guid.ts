import { MigrationInterface, QueryRunner } from 'typeorm';

export class addBceidBusinessGuid1678920537588 implements MigrationInterface {
  name = 'addBceidBusinessGuid1678920537588';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."user" ADD "bceid_business_guid" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."user" DROP COLUMN "bceid_business_guid"`,
    );
  }
}
