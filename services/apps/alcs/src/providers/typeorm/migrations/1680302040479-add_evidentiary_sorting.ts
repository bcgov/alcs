import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEvidentiarySorting1680302040479 implements MigrationInterface {
  name = 'addEvidentiarySorting1680302040479';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" ADD "evidentiary_record_sorting" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_document" DROP COLUMN "evidentiary_record_sorting"`,
    );
  }
}
