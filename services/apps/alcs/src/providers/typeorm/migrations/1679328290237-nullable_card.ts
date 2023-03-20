import { MigrationInterface, QueryRunner } from 'typeorm';

export class nullableCard1679328290237 implements MigrationInterface {
  name = 'nullableCard1679328290237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ALTER COLUMN "card_uuid" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ALTER COLUMN "card_uuid" SET NOT NULL`,
    );
  }
}
