import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameOwnerLabels1690996670589 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "alcs"."application_owner_type" SET "label" = 'Third-Party Agent' WHERE "code" = 'AGEN';
      UPDATE "alcs"."application_owner_type" SET "label" = 'Land Owner' WHERE "code" = 'ORGZ';
      UPDATE "alcs"."application_owner_type" SET "label" = 'Land Owner' WHERE "code" = 'INDV';
      UPDATE "alcs"."application_owner_type" SET "label" = 'Local or First Nation Government Staff' WHERE "code" = 'GOVR';
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
