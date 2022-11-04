import { MigrationInterface, QueryRunner } from 'typeorm';

export class addResolutionToDecision1667585061964
  implements MigrationInterface
{
  name = 'addResolutionToDecision1667585061964';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE "application_decision" CASCADE`);
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD "resolution_number" smallint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD "resolution_year" smallint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "resolution" UNIQUE ("resolution_number", "resolution_year")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "resolution"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP COLUMN "resolution_year"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP COLUMN "resolution_number"`,
    );
  }
}
