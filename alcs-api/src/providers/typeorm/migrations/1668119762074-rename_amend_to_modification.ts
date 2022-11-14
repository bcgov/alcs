import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameAmendToModification1668119762074
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_amendment" RENAME TO "application_modification";`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" RENAME COLUMN "amends_uuid" TO "modifies_uuid";`,
    );

    await queryRunner.query(
      `ALTER TABLE "amended_decisions" RENAME TO "modified_decisions";`,
    );
    await queryRunner.query(
      `ALTER TABLE "modified_decisions" RENAME COLUMN "application_amendment_uuid" to "application_modification_uuid";`,
    );

    await queryRunner.query(
      `INSERT INTO "card_type" (audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"label",code,description) VALUES
	    (NULL,NOW(),NULL,'migration_seed',NULL,'Modification','MODI','Modification type card');`,
    );

    await queryRunner.query(
      ` UPDATE "card" SET "type_code" = 'MODI' WHERE "type_code" = 'AMEND';`,
    );

    await queryRunner.query(` DELETE FROM "card_type" WHERE "code" = 'AMEND';`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //Please no
  }
}
