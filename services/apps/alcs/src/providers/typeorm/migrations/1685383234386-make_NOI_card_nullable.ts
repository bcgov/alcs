import { MigrationInterface, QueryRunner } from 'typeorm';

export class makeNOICardNullable1685383234386 implements MigrationInterface {
  name = 'makeNOICardNullable1685383234386';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ALTER COLUMN "card_uuid" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ALTER COLUMN "card_uuid" SET NOT NULL`,
    );
  }
}
