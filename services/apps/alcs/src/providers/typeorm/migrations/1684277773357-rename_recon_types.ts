import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameReconTypes1684277773357 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "alcs"."application_reconsideration_type" SET "label" = '33 (Affected Party)' WHERE "code" = '33'
    `);
    await queryRunner.query(`
      UPDATE "alcs"."application_reconsideration_type" SET "label" = '33.1 (Chair Directed)' WHERE "code" = '33.1'
    `);

    await queryRunner.query(`
      UPDATE "alcs"."application_modification_outcome_type" SET "label" = 'Proceed to Modify' WHERE "code" = 'PRC'
    `);
    await queryRunner.query(`
      UPDATE "alcs"."application_modification_outcome_type" SET "label" = 'Refuse to Modify' WHERE "code" = 'REF'
    `);

    await queryRunner.query(`
      UPDATE "alcs"."application_reconsideration_outcome_type" SET "label" = 'Proceed to Reconsider' WHERE "code" = 'PRC'
    `);
    await queryRunner.query(`
      UPDATE "alcs"."application_reconsideration_outcome_type" SET "label" = 'Refuse to Reconsider' WHERE "code" = 'REF'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
