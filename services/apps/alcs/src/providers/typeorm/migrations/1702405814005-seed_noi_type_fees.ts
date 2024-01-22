import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedNoiTypeFees1702405814005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "alcs"."notice_of_intent_type" SET "alc_fee_amount" = 150 WHERE "code" = 'ROSO';
      UPDATE "alcs"."notice_of_intent_type" SET "alc_fee_amount" = 150 WHERE "code" = 'POFO';
      UPDATE "alcs"."notice_of_intent_type" SET "alc_fee_amount" = 150 WHERE "code" = 'PFRS';
    `);
  }

  public async down(): Promise<void> {}
}
