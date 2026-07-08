import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAmountToCAndEOrder1783528672659 implements MigrationInterface {
  name = 'AddAmountToCAndEOrder1783528672659';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_order" ADD "amount" numeric(10, 2)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_order" DROP COLUMN "amount"`);
  }
}
