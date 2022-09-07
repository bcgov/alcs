import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDecisionDate1662577090077 implements MigrationInterface {
  name = 'addDecisionDate1662577090077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" ADD "decision_date" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "decision_date"`,
    );
  }
}
