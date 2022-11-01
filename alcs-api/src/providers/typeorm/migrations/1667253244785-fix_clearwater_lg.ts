import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixClearwaterLg1667253244785 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE "application_local_government" SET name = 'District of Clearwater' WHERE name = 'District of Clearwater ';`);
    await queryRunner.query(`
        UPDATE "application_local_government" SET name = 'City of Delta' WHERE name = 'District of Delta';`);
  }

  public async down(): Promise<void> {
    //No
  }
}
