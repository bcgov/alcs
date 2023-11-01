import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeLinkedOutcomeForAppDecs1698104086542
  implements MigrationInterface
{
  name = 'removeLinkedOutcomeForAppDecs1698104086542';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_c29e943593d2eee247eec5361e5"`,
    );
    await queryRunner.query(`
      DROP TABLE "alcs"."linked_resolution_outcome_type";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "alcs"."linked_resolution_outcome_type" (
        "audit_deleted_date_at" timestamptz,
        "audit_created_at" timestamptz NOT NULL DEFAULT now(),
        "audit_updated_at" timestamptz DEFAULT now(),
        "audit_created_by" varchar NOT NULL,
        "audit_updated_by" varchar,
        "label" varchar NOT NULL,
        "code" text NOT NULL,
        "description" text NOT NULL,
        PRIMARY KEY ("code")
      );
    `);
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_c29e943593d2eee247eec5361e5" FOREIGN KEY ("linked_resolution_outcome_code") REFERENCES "alcs"."linked_resolution_outcome_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
