import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlanningReviewsV21709662671997 implements MigrationInterface {
  name = 'PlanningReviewsV21709662671997';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW "alcs"."non_application_search_view"`);
    await queryRunner.query(`TRUNCATE TABLE "alcs"."planning_review"`);
    await queryRunner.query(
      `UPDATE "alcs"."card" SET "audit_deleted_date_at" = NOW(), "archived" = true WHERE "type_code" = 'PLAN'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP CONSTRAINT "FK_735dcdd4fa909a60d0fa1828f24"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_a62913da5fae4a128c8e8f264f"`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."planning_review_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, "short_label" character varying NOT NULL, "background_color" character varying NOT NULL, "text_color" character varying NOT NULL, "html_description" text NOT NULL DEFAULT '', CONSTRAINT "UQ_ab764743ecbd39b1fc823d2445d" UNIQUE ("description"), CONSTRAINT "PK_d06659689a2bb22ccdc6a1a033b" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."planning_referral" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "submission_date" TIMESTAMP WITH TIME ZONE NOT NULL, "due_date" TIMESTAMP WITH TIME ZONE, "response_date" TIMESTAMP WITH TIME ZONE, "referral_description" text, "response_description" text, "card_uuid" uuid NOT NULL, "planning_review_uuid" uuid, CONSTRAINT "REL_57f6fea41fefa2ca864a33b795" UNIQUE ("card_uuid"), CONSTRAINT "PK_1cd8a7e0399adfcc4cbd1ca7cb9" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP COLUMN "type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP CONSTRAINT IF EXISTS "REL_03a05aa8fefbc2fc1cdf138d80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP COLUMN "card_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD "document_name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD "type_code" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD "open" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD "closed_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD "closed_by_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD CONSTRAINT "FK_d06659689a2bb22ccdc6a1a033b" FOREIGN KEY ("type_code") REFERENCES "alcs"."planning_review_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD CONSTRAINT "FK_84caebfef3502f3fb80e168ba44" FOREIGN KEY ("closed_by_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_referral" ADD CONSTRAINT "FK_095877a396b8c604d81d674f6f8" FOREIGN KEY ("planning_review_uuid") REFERENCES "alcs"."planning_review"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_referral" ADD CONSTRAINT "FK_57f6fea41fefa2ca864a33b7950" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_referral" DROP CONSTRAINT "FK_57f6fea41fefa2ca864a33b7950"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_referral" DROP CONSTRAINT "FK_095877a396b8c604d81d674f6f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP CONSTRAINT "FK_84caebfef3502f3fb80e168ba44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP CONSTRAINT "FK_d06659689a2bb22ccdc6a1a033b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP COLUMN "closed_by_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP COLUMN "closed_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP COLUMN "open"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP COLUMN "type_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" DROP COLUMN "document_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD "card_uuid" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD CONSTRAINT "REL_03a05aa8fefbc2fc1cdf138d80" UNIQUE ("card_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD "type" character varying NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."planning_referral"`);
    await queryRunner.query(`DROP TABLE "alcs"."planning_review_type"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_a62913da5fae4a128c8e8f264f" ON "alcs"."planning_review" ("file_number") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review" ADD CONSTRAINT "FK_735dcdd4fa909a60d0fa1828f24" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
