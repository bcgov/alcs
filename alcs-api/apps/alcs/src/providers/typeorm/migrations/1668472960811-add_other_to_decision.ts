import { MigrationInterface, QueryRunner } from 'typeorm';

export class addOtherToDecision1668472960811 implements MigrationInterface {
  name = 'addOtherToDecision1668472960811';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD "is_other" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP COLUMN "is_other"`,
    );
  }
}
