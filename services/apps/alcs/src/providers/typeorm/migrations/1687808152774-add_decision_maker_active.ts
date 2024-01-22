import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDecisionMakerActive1687808152774 implements MigrationInterface {
  name = 'addDecisionMakerActive1687808152774';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_maker_code" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_maker_code" DROP COLUMN "is_active"`,
    );
  }
}
