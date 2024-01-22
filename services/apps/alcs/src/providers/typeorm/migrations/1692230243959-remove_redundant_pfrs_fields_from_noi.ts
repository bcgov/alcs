import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeRedundantPfrsFieldsFromNoi1692230243959
  implements MigrationInterface
{
  name = 'removeRedundantPfrsFieldsFromNoi1692230243959';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_reduce_negative_impacts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_alternative_measures"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_alternative_measures" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_reduce_negative_impacts" text`,
    );
  }
}
