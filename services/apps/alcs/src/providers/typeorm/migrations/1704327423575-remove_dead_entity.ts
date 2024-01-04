import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDeadEntity1704327423575 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE "alcs"."application_reconsideration_decision_outcome_type"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_reconsideration_decision_outcome_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_cbc26f96619063caff5e504b1a6" UNIQUE ("description"), CONSTRAINT "PK_7bbc4f41af4ccdf91600ab2213b" PRIMARY KEY ("code"))`,
    );
  }
}
