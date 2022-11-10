import { MigrationInterface, QueryRunner } from 'typeorm';

export class regenerateAmendsDecisionsFks1668105252152
  implements MigrationInterface
{
  name = 'regenerateAmendsDecisionsFks1668105252152';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "FK_3142742a93fe3ad2a9126d0f025"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "FK_36c741e57451dc780e6968fe485"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "UQ_3142742a93fe3ad2a9126d0f025" UNIQUE ("amends_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "UQ_36c741e57451dc780e6968fe485" UNIQUE ("reconsiders_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "FK_3142742a93fe3ad2a9126d0f025" FOREIGN KEY ("amends_uuid") REFERENCES "application_amendment"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "FK_36c741e57451dc780e6968fe485" FOREIGN KEY ("reconsiders_uuid") REFERENCES "application_reconsideration"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "FK_36c741e57451dc780e6968fe485"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "FK_3142742a93fe3ad2a9126d0f025"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "UQ_36c741e57451dc780e6968fe485"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "UQ_3142742a93fe3ad2a9126d0f025"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "FK_36c741e57451dc780e6968fe485" FOREIGN KEY ("reconsiders_uuid") REFERENCES "application_reconsideration"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "FK_3142742a93fe3ad2a9126d0f025" FOREIGN KEY ("amends_uuid") REFERENCES "application_amendment"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
