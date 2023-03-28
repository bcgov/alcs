import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAppPayments1679950423581 implements MigrationInterface {
  name = 'addAppPayments1679950423581';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" RENAME COLUMN "date_paid" TO "fee_paid_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "fee_waived" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "fee_split_with_lg" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "fee_amount" numeric(12,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "fee_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "fee_split_with_lg"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "fee_waived"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" RENAME COLUMN "fee_paid_date" TO "date_paid"`,
    );
  }
}
