import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDecisionDocument1664926585209 implements MigrationInterface {
  name = 'addDecisionDocument1664926585209';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "decision_document" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "decision_uuid" uuid NOT NULL, "document_uuid" uuid, CONSTRAINT "REL_83717f1d73931fd18e810c03aa" UNIQUE ("document_uuid"), CONSTRAINT "PK_251180d41aea07259eb6686a4e7" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision_document" ADD CONSTRAINT "FK_a86632c9a6ab56e984cf1cc9e6b" FOREIGN KEY ("decision_uuid") REFERENCES "application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision_document" ADD CONSTRAINT "FK_83717f1d73931fd18e810c03aa7" FOREIGN KEY ("document_uuid") REFERENCES "document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "decision_document"`);
  }
}
