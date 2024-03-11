import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrDocuments1709856439937 implements MigrationInterface {
  name = 'AddPrDocuments1709856439937';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."planning_review_document" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "type_code" text, "description" text, "planning_review_uuid" uuid NOT NULL, "document_uuid" uuid, "visibility_flags" text array NOT NULL DEFAULT '{}', "evidentiary_record_sorting" integer, CONSTRAINT "REL_80d9441726c3d26ccd426cd469" UNIQUE ("document_uuid"), CONSTRAINT "PK_b8b1ceeaebfc4a6b5a746f0a85b" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e95903f18d734736a1ba855569" ON "alcs"."planning_review_document" ("planning_review_uuid") `,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."planning_review_document" IS 'Stores planning review documents'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_document" ADD CONSTRAINT "FK_6ed3e4681afbbcd3444d7600a84" FOREIGN KEY ("type_code") REFERENCES "alcs"."document_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_document" ADD CONSTRAINT "FK_e95903f18d734736a1ba8555698" FOREIGN KEY ("planning_review_uuid") REFERENCES "alcs"."planning_review"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_document" ADD CONSTRAINT "FK_80d9441726c3d26ccd426cd4699" FOREIGN KEY ("document_uuid") REFERENCES "alcs"."document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_document" DROP CONSTRAINT "FK_80d9441726c3d26ccd426cd4699"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_document" DROP CONSTRAINT "FK_e95903f18d734736a1ba8555698"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."planning_review_document" DROP CONSTRAINT "FK_6ed3e4681afbbcd3444d7600a84"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_e95903f18d734736a1ba855569"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."planning_review_document"`);
  }
}
