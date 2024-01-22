import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdjustNoiWeights1701900373356 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "alcs"."notice_of_intent_submission_status_type" SET "weight" = 5 WHERE "code" = 'CANC';
    `);
    await queryRunner.query(`
      UPDATE "alcs"."notice_of_intent_submission_status_type" SET "weight" = 4 WHERE "code" = 'ALCD';
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
