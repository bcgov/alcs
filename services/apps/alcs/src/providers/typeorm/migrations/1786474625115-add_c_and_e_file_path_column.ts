import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCAndEFilePathColumn1786474625115 implements MigrationInterface {
  name = 'AddCAndEFilePathColumn1786474625115';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement" ADD "file_path" text NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement" DROP COLUMN "file_path"`);
  }
}
