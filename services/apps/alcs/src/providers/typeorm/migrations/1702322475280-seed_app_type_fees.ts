import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAppTypeFees1702322475280 implements MigrationInterface {
  name = 'SeedAppTypeFees1702322475280';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE "alcs"."application_type" SET "alc_fee_amount" = 1500 WHERE "code" = 'TURP';
        UPDATE "alcs"."application_type" SET "alc_fee_amount" = 750, "government_fee_amount" = 750 WHERE "code" = 'SUBD';
        UPDATE "alcs"."application_type" SET "alc_fee_amount" = 750, "government_fee_amount" = 750 WHERE "code" = 'ROSO';
        UPDATE "alcs"."application_type" SET "alc_fee_amount" = 750, "government_fee_amount" = 750 WHERE "code" = 'POFO';
        UPDATE "alcs"."application_type" SET "alc_fee_amount" = 750, "government_fee_amount" = 750 WHERE "code" = 'PFRS';
        UPDATE "alcs"."application_type" SET "alc_fee_amount" = 450, "government_fee_amount" = 450 WHERE "code" = 'NARU';
        UPDATE "alcs"."application_type" SET "alc_fee_amount" = 750, "government_fee_amount" = 750 WHERE "code" = 'NFUP';
        UPDATE "alcs"."application_type" SET "alc_fee_amount" = 750, "government_fee_amount" = 750 WHERE "code" = 'EXCL';
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
