import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoiRetroactive1685552871563 implements MigrationInterface {
  name = 'addNoiRetroactive1685552871563';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "retroactive" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "retroactive"`,
    );
  }
}
