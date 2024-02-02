import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameHudsons1706567315337 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "alcs"."local_government" SET "name" = 'District of Hudson''s Hope' WHERE "uuid" = 'df19457c-4511-4104-bc85-9675412a6359';
    `);
  }

  public async down(): Promise<void> {}
}
