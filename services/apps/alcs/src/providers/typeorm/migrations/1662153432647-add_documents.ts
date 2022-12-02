import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDocuments1662153432647 implements MigrationInterface {
  name = 'addDocuments1662153432647';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "document" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "file_name" character varying NOT NULL, "mime_type" character varying NOT NULL, "uploaded_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "uploaded_by_uuid" uuid NOT NULL, CONSTRAINT "PK_8960855240f8a386eed1d7791c1" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "application_document" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "type" character varying NOT NULL, "application_uuid" uuid, "document_uuid" uuid, CONSTRAINT "REL_12ae8ee45c8e1f1b074c169a3e" UNIQUE ("document_uuid"), CONSTRAINT "PK_87ec4d3edd458858cf7370ddfd3" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "document" ADD CONSTRAINT "FK_9b9254f412e8a5a07063209a08c" FOREIGN KEY ("uploaded_by_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" ADD CONSTRAINT "FK_6c496454f95f229c63679bf191e" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" ADD CONSTRAINT "FK_12ae8ee45c8e1f1b074c169a3e5" FOREIGN KEY ("document_uuid") REFERENCES "document"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_document" DROP CONSTRAINT "FK_12ae8ee45c8e1f1b074c169a3e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" DROP CONSTRAINT "FK_6c496454f95f229c63679bf191e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document" DROP CONSTRAINT "FK_9b9254f412e8a5a07063209a08c"`,
    );
    await queryRunner.query(`DROP TABLE "application_document"`);
    await queryRunner.query(`DROP TABLE "document"`);
  }
}
