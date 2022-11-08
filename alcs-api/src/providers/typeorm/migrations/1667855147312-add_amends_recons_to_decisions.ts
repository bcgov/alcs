import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAmendsReconsToDecisions1667855147312
  implements MigrationInterface
{
  name = 'addAmendsReconsToDecisions1667855147312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE "application_decision" CASCADE`);

    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD "amends_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD "reconsiders_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "FK_3142742a93fe3ad2a9126d0f025" FOREIGN KEY ("amends_uuid") REFERENCES "application_amendment"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "FK_36c741e57451dc780e6968fe485" FOREIGN KEY ("reconsiders_uuid") REFERENCES "application_reconsideration"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "decision_outcome_code" ADD "for_first_decision" boolean NOT NULL DEFAULT true`,
    );

    await queryRunner.query(`INSERT INTO "decision_outcome_code"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "for_first_decision") VALUES
        (NULL, '2022-10-31 17:55:34.498608+00', NULL, 'alcs-api', NULL, 'Confirm', 'CONF', 'Decision confirms previous resolution', false),
        (NULL, '2022-10-31 17:55:34.498608+00', NULL, 'alcs-api', NULL, 'Reverse', 'REVE', 'Decision reverses the previous resolution', false),
        (NULL, '2022-10-31 17:55:34.498608+00', NULL, 'alcs-api', NULL, 'Vary', 'VARY', 'Decision varies the previous resolution', false);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "decision_outcome_code" DROP COLUMN "for_first_decision"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "FK_36c741e57451dc780e6968fe485"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "FK_3142742a93fe3ad2a9126d0f025"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP COLUMN "reconsiders_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP COLUMN "amends_uuid"`,
    );
  }
}
