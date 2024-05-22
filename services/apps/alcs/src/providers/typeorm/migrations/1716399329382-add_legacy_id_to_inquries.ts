import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLegacyIdToInquries1716399329382 implements MigrationInterface {
  name = 'AddLegacyIdToInquries1716399329382';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" ADD "legacy_id" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" DROP COLUMN "legacy_id"`,
    );
  }
}
