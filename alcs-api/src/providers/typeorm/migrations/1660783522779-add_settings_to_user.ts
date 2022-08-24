import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSettingsToUser1660783522779 implements MigrationInterface {
  name = 'addSettingsToUser1660783522779';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "settings" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "settings"`);
  }
}
