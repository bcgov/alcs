import { MigrationInterface, QueryRunner } from 'typeorm';

export class addApplicationUser1669403694217 implements MigrationInterface {
  name = 'addApplicationUser1669403694217';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "portal"."user" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "email" character varying NOT NULL, "display_name" character varying NOT NULL, "identity_provider" character varying NOT NULL, "preferred_username" character varying NOT NULL, "name" character varying, "bceid_guid" character varying, "bceid_user_name" character varying, "client_roles" text array NOT NULL DEFAULT '{}', CONSTRAINT "PK_a95e949168be7b7ece1a2382fed" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_298a928993eee3de03067af610" ON "portal"."user" ("bceid_guid") `,
    );
    await queryRunner.query(
      `CREATE TABLE "portal"."application_document" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "type" character varying NOT NULL, "application_uuid" character varying NOT NULL, "alcs_document_uuid" character varying NOT NULL, "application_file_number" character varying NOT NULL, "uploaded_by_uuid" uuid NOT NULL, CONSTRAINT "PK_87ec4d3edd458858cf7370ddfd3" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "portal"."application" ("file_number" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "applicant" character varying NOT NULL, "local_government_uuid" uuid NOT NULL, CONSTRAINT "PK_39c4f5ceb0f5a7a4c819d46a0d5" PRIMARY KEY ("file_number"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ADD CONSTRAINT "FK_92f7df78b61a235c89d08c34e3b" FOREIGN KEY ("application_file_number") REFERENCES "portal"."application"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" ADD CONSTRAINT "FK_46513c7fcfe20e70a9bef55baae" FOREIGN KEY ("uploaded_by_uuid") REFERENCES "portal"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" DROP CONSTRAINT "FK_46513c7fcfe20e70a9bef55baae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_document" DROP CONSTRAINT "FK_92f7df78b61a235c89d08c34e3b"`,
    );
    await queryRunner.query(`DROP TABLE "portal"."application"`);
    await queryRunner.query(`DROP TABLE "portal"."application_document"`);
    await queryRunner.query(
      `DROP INDEX "portal"."IDX_298a928993eee3de03067af610"`,
    );
    await queryRunner.query(`DROP TABLE "portal"."user"`);
  }
}
