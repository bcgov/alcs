import { MigrationInterface, QueryRunner } from 'typeorm';

export class createDocCodes1679677220464 implements MigrationInterface {
  name = 'createDocCodes1679677220464';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_document_code" (
        "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE,
        "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "audit_created_by" character varying NOT NULL,
        "audit_updated_by" character varying,
        "label" character varying NOT NULL,
        "code" text NOT NULL,
        "description" text NOT NULL,
        "oats_code" text NOT NULL,
        CONSTRAINT "UQ_dae191d1246f18def0a58114ce6" UNIQUE ("description"),
        CONSTRAINT "UQ_ac34044abf61cdd68fb8a281f99" UNIQUE ("oats_code"),
        CONSTRAINT "PK_3b6dbe5c8fba63b0f57a95df280" PRIMARY KEY ("code")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "alcs"."application_document_code"`);
  }
}
