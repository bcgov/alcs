import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoiIntakeFields1692030508798 implements MigrationInterface {
  name = 'addNoiIntakeFields1692030508798';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "fee_waived" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "fee_split_with_lg" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "fee_amount" numeric(12,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "fee_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "fee_split_with_lg"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "fee_waived"`,
    );
  }
}
