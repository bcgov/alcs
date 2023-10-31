import { MigrationInterface, QueryRunner } from 'typeorm';

export class relabelSrwTerms1698708663714 implements MigrationInterface {
  name = 'relabelSrwTerms1698708663714';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "alcs"."document_code" SET "label" = 'Terms of Instrument', "description" = 'SRW Terms of Instrument Documents' WHERE "code" = 'SRTD';
    `);
  }

  public async down(): Promise<void> {
    //NOPE
  }
}
