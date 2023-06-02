import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDecMakerName1685659177289 implements MigrationInterface {
  name = 'addDecMakerName1685659177289';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" ADD "decision_maker_name" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "decision_maker_name"`,
    );
  }
}
