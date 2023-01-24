import { MigrationInterface, QueryRunner } from 'typeorm';

export class addOwners1674502121879 implements MigrationInterface {
  name = 'addOwners1674502121879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "portal"."application_owner_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_1226285ea7299ecd8980e56ace8" UNIQUE ("description"), CONSTRAINT "PK_05181ec6491ee0aa527bd55c714" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "portal"."application_owner" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "first_name" character varying, "last_name" character varying, "organization_name" character varying, "phone_number" character varying, "email" character varying, "type_code" text NOT NULL, CONSTRAINT "PK_9b2fecd11351ea787e05900672d" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel" ADD "owner_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel" ADD CONSTRAINT "FK_90518afe0f5d14d721877fdb815" FOREIGN KEY ("owner_uuid") REFERENCES "portal"."application_owner"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_owner" ADD CONSTRAINT "FK_05181ec6491ee0aa527bd55c714" FOREIGN KEY ("type_code") REFERENCES "portal"."application_owner_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `INSERT INTO "portal"."application_owner_type" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Individual', 'INDV', 'Individual'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Organization', 'ORGZ', 'Organization');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_owner" DROP CONSTRAINT "FK_05181ec6491ee0aa527bd55c714"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel" DROP CONSTRAINT "FK_90518afe0f5d14d721877fdb815"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel" DROP COLUMN "owner_uuid"`,
    );
    await queryRunner.query(`DROP TABLE "portal"."application_owner"`);
    await queryRunner.query(`DROP TABLE "portal"."application_owner_type"`);
  }
}
