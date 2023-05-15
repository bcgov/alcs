import { MigrationInterface, QueryRunner } from 'typeorm';

export class uniqueConstraintForComponents1683937664541
  implements MigrationInterface
{
  name = 'uniqueConstraintForComponents1683937664541';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d300a86af8c22c1d9a55fbc28b" ON "alcs"."application_decision_component" ("application_decision_component_type_code", "application_decision_uuid") WHERE "audit_deleted_date_at" is null`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_d300a86af8c22c1d9a55fbc28b"`,
    );
  }
}
