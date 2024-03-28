import { MigrationInterface, QueryRunner } from 'typeorm';

export class FileNumber1710437289952 implements MigrationInterface {
  name = 'FileNumber1710437289952';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" ADD "file_number" character varying NOT NULL DEFAULT NEXTVAL('alcs.alcs_file_number_seq')`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" ADD CONSTRAINT "UQ_419b155603f3444977c64c6dd72" UNIQUE ("file_number")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" DROP CONSTRAINT "UQ_419b155603f3444977c64c6dd72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."inquiry" DROP COLUMN "file_number"`,
    );
  }
}
