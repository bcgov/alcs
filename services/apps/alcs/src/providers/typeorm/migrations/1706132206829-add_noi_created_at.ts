import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNoiCreatedAt1706132206829 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" ADD "created_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "created_at"`,
    );
  }
}
