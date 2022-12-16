import { MigrationInterface, QueryRunner } from 'typeorm';

export class fileNumberSequence1671149821972 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE SEQUENCE IF NOT EXISTS "alcs"."alcs_file_number"
        INCREMENT 1
        MINVALUE 100000
        START 100000
        NO CYCLE;
      `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ALTER COLUMN "file_number" SET DEFAULT NEXTVAL('alcs.alcs_file_number');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS "alcs"."alcs_file_number";`,
    );
  }
}
