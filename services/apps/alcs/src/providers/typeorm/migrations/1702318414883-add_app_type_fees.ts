import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAppTypeFees1702318414883 implements MigrationInterface {
  name = 'AddAppTypeFees1702318414883';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_type" ADD "alc_fee_amount" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_type" ADD "government_fee_amount" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_type" ADD "alc_fee_amount" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_type" ADD "government_fee_amount" numeric(12,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_type" DROP COLUMN "government_fee_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_type" DROP COLUMN "alc_fee_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_type" DROP COLUMN "government_fee_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_type" DROP COLUMN "alc_fee_amount"`,
    );
  }
}
