import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserBusiness1696358673288 implements MigrationInterface {
  name = 'addUserBusiness1696358673288';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."user" ADD "business_name" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."user" DROP COLUMN "business_name"`,
    );
  }
}
