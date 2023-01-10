import { MigrationInterface, QueryRunner } from 'typeorm';

export class splitDocuments1673305101602 implements MigrationInterface {
  name = 'splitDocuments1673305101602';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "portal"."application_document"`);

    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" DROP CONSTRAINT "FK_46513c7fcfe20e70a9bef55baae"`,
    );
    await queryRunner.query(
      `CREATE TABLE "portal"."document" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "alcs_document_uuid" character varying NOT NULL, "file_name" character varying NOT NULL, "file_size" integer NOT NULL, "uploaded_by_uuid" uuid NOT NULL, CONSTRAINT "PK_8960855240f8a386eed1d7791c1" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" DROP COLUMN "alcs_document_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" DROP COLUMN "uploaded_by_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" DROP COLUMN "file_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" DROP COLUMN "file_size"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ADD "document_uuid" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ADD CONSTRAINT "UQ_12ae8ee45c8e1f1b074c169a3e5" UNIQUE ("document_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."document" ADD CONSTRAINT "FK_9b9254f412e8a5a07063209a08c" FOREIGN KEY ("uploaded_by_uuid") REFERENCES "portal"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ADD CONSTRAINT "FK_12ae8ee45c8e1f1b074c169a3e5" FOREIGN KEY ("document_uuid") REFERENCES "portal"."document"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" DROP CONSTRAINT "FK_12ae8ee45c8e1f1b074c169a3e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."document" DROP CONSTRAINT "FK_9b9254f412e8a5a07063209a08c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" DROP CONSTRAINT "UQ_12ae8ee45c8e1f1b074c169a3e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" DROP COLUMN "document_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ADD "file_size" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ADD "file_name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ADD "uploaded_by_uuid" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ADD "alcs_document_uuid" character varying NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "portal"."document"`);
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ADD CONSTRAINT "FK_46513c7fcfe20e70a9bef55baae" FOREIGN KEY ("uploaded_by_uuid") REFERENCES "portal"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
