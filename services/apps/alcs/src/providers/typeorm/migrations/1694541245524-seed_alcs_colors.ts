import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedAlcsColors1694541245524 implements MigrationInterface {
  name = 'seedAlcsColors1694541245524';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "alcs"."notice_of_intent_type" SET "background_color" = '#084299', "text_color" = '#fff' WHERE "code" = 'PFRS';
      UPDATE "alcs"."notice_of_intent_type" SET "background_color" = '#084299', "text_color" = '#fff' WHERE "code" = 'POFO';
      UPDATE "alcs"."notice_of_intent_type" SET "background_color" = '#084299', "text_color" = '#fff' WHERE "code" = 'ROSO';
    `);

    await queryRunner.query(`
      UPDATE "alcs"."notification_type" SET "background_color" = '#59ADFA', "text_color" = '#000' WHERE "code" = 'SRW';
    `);

    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_type" ALTER COLUMN "background_color" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_type" ALTER COLUMN "text_color" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_type" ALTER COLUMN "background_color" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_type" ALTER COLUMN "text_color" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_type" ALTER COLUMN "text_color" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notification_type" ALTER COLUMN "background_color" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_type" ALTER COLUMN "text_color" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_type" ALTER COLUMN "background_color" DROP NOT NULL`,
    );
  }
}
