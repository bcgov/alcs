import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAlcsColorsToNewTypes1694540511529
  implements MigrationInterface
{
  name = 'addAlcsColorsToNewTypes1694540511529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_type" ADD "background_color" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_type" ADD "text_color" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_type" ADD "background_color" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_type" ADD "text_color" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_type" DROP COLUMN "text_color"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_type" DROP COLUMN "background_color"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_type" DROP COLUMN "text_color"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_type" DROP COLUMN "background_color"`,
    );
  }
}
