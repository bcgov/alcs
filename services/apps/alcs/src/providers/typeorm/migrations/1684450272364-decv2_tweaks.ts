import { MigrationInterface, QueryRunner } from 'typeorm';

export class decv2Tweaks1684450272364 implements MigrationInterface {
  name = 'decv2Tweaks1684450272364';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."linked_resolution_outcome_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_06c0f8e670807cd42f458b07f12" UNIQUE ("description"), CONSTRAINT "PK_2a8f59e9bf0066e12d2846a3d2f" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "linked_resolution_outcome_code" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_c29e943593d2eee247eec5361e5" FOREIGN KEY ("linked_resolution_outcome_code") REFERENCES "alcs"."linked_resolution_outcome_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_c29e943593d2eee247eec5361e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "linked_resolution_outcome_code"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."linked_resolution_outcome_type"`,
    );
  }
}
