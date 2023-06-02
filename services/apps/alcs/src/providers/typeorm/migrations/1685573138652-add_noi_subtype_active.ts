import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoiSubtypeActive1685573138652 implements MigrationInterface {
  name = 'addNoiSubtypeActive1685573138652';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_subtype" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_subtype" DROP COLUMN "is_active"`,
    );
  }
}
