import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNaruSubtype1686766958056 implements MigrationInterface {
  name = 'addNaruSubtype1686766958056';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "naru_subtype" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_subtype"`,
    );
  }
}
