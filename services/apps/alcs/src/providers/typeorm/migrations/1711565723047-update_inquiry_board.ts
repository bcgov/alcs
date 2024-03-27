import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInquiryBoard1711565723047 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        UPDATE alcs.board SET code = 'inqr' where uuid = 'c24234e9-748c-48db-9a0f-88e447473c8e';
    `);
  }

  public async down(): Promise<void> {
    // nope
  }
}
