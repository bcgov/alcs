import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveComponentTypeConstraint1702500300592
  implements MigrationInterface
{
  name = 'RemoveComponentTypeConstraint1702500300592';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "alcs"."IDX_d300a86af8c22c1d9a55fbc28b"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d300a86af8c22c1d9a55fbc28b" ON "alcs"."application_decision_component" ("application_decision_component_type_code", "application_decision_uuid") WHERE (audit_deleted_date_at IS NULL)`,
    );
  }
}
