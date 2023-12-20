import { MigrationInterface, QueryRunner } from 'typeorm';

export class NullableCardUuidOnNoi1702925001694 implements MigrationInterface {
  name = 'NullableCardUuidOnNoi1702925001694';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" DROP CONSTRAINT "FK_bf0ebc2212d34996113c9de2284"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" ALTER COLUMN "card_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" ADD CONSTRAINT "FK_bf0ebc2212d34996113c9de2284" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" DROP CONSTRAINT "FK_bf0ebc2212d34996113c9de2284"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" ALTER COLUMN "card_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" ADD CONSTRAINT "FK_bf0ebc2212d34996113c9de2284" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
