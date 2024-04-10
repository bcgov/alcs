import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMaintenanceBannerConfig1712707802345
  implements MigrationInterface
{
  name = 'AddMaintenanceBannerConfig1712707802345';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."configuration" ("name", "value") VALUES ('app_maintenance_banner', 'false');
    `);

    await queryRunner.query(`
      INSERT INTO "alcs"."configuration" ("name", "value") VALUES ('app_maintenance_banner_message', '');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "alcs"."configuration" WHERE "name" = 'app_maintenance_banner_message';
    `);

    await queryRunner.query(`
      DELETE FROM "alcs"."configuration" WHERE "name" = 'app_maintenance_banner';
    `);
  }
}
