import { MigrationInterface, QueryRunner } from 'typeorm';

export class applicationParcel1674159745882 implements MigrationInterface {
  name = 'applicationParcel1674159745882';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `create table "portal"."application_parcel_document" ("uuid" uuid not null default gen_random_uuid(),
      "type" character varying not null,
      "application_parcel_uuid" uuid not null,
      "document_uuid" uuid not null,
      constraint "REL_66430bd7d2b199d4885a0d5a34" unique ("document_uuid"),
      constraint "PK_2a0f8c3c86cecd1d79cf24e1da2" primary key ("uuid")); comment on
      column "portal"."application_parcel_document"."application_parcel_uuid" is 'Application parcel uuid'`,
    );
    await queryRunner.query(
      `create table "portal"."application_parcel_ownership_type" ("audit_deleted_date_at" TIMESTAMP with TIME zone,
      "audit_created_at" TIMESTAMP with TIME zone not null default now(),
      "audit_updated_at" TIMESTAMP with TIME zone default now(),
      "audit_created_by" character varying not null,
      "audit_updated_by" character varying,
      "label" character varying not null,
      "code" text not null,
      "description" text not null,
      constraint "UQ_e050bb4797be99f27d11cfaae2b" unique ("description"),
      constraint "PK_33f7b06b2c4e0e128d670526c66" primary key ("code"))`,
    );
    await queryRunner.query(
      `create table "portal"."application_parcel" ("audit_deleted_date_at" TIMESTAMP with TIME zone,
      "audit_created_at" TIMESTAMP with TIME zone not null default now(),
      "audit_updated_at" TIMESTAMP with TIME zone default now(),
      "audit_created_by" character varying not null,
      "audit_updated_by" character varying,
      "uuid" uuid not null default gen_random_uuid(),
      "pid" character varying,
      "pin" character varying,
      "legal_description" character varying,
      "map_area_hectares" double precision,
      "is_farm" boolean,
      "purchased_date" TIMESTAMP with TIME zone,
      "is_confirmed_by_applicant" boolean not null default false,
      "application_file_number" character varying not null,
      "ownership_type_code" text,
      constraint "PK_4c88659b418020abbb9b65fd4e0" primary key ("uuid"));
      
      comment on
      column "portal"."application_parcel"."pid" is 'The Parcels pid entered by the user or populated from third-party data';
      
      comment on
      column "portal"."application_parcel"."pin" is 'The Parcels pin entered by the user or populated from third-party data';
      
      comment on
      column "portal"."application_parcel"."legal_description" is 'The Parcels legalDescription entered by the user or populated from third-party data';
      
      comment on
      column "portal"."application_parcel"."map_area_hectares" is 'The Parcels map are in hectares entered by the user or populated from third-party data';
      
      comment on
      column "portal"."application_parcel"."is_farm" is 'The Parcels indication whether it is used as a farm';
      
      comment on
      column "portal"."application_parcel"."purchased_date" is 'The Parcels purchase date provided by user';
      
      comment on
      column "portal"."application_parcel"."is_confirmed_by_applicant" is 'The Parcels indication whether applicant signed off provided data including the Certificate of Title';
      
      comment on
      column "portal"."application_parcel"."application_file_number" is 'The application file id that parcel is linked to'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel_document" ADD CONSTRAINT "FK_31dce1c6fcd24fc6bd45824fea5" FOREIGN KEY ("application_parcel_uuid") REFERENCES "portal"."application_parcel"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel_document" ADD CONSTRAINT "FK_66430bd7d2b199d4885a0d5a343" FOREIGN KEY ("document_uuid") REFERENCES "portal"."document"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel" ADD CONSTRAINT "FK_803e574fe048adacb88443c8d45" FOREIGN KEY ("application_file_number") REFERENCES "portal"."application"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel" ADD CONSTRAINT "FK_33f7b06b2c4e0e128d670526c66" FOREIGN KEY ("ownership_type_code") REFERENCES "portal"."application_parcel_ownership_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `INSERT INTO "portal"."application_parcel_ownership_type" 
                    ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
                    (NULL, NOW(), NULL, 'migration_seed', NULL, 'Fee Simple', 'SMPL', 'Fee Simple'),
                    (NULL, NOW(), NULL, 'migration_seed', NULL, 'Crown', 'CRWN', 'Crown');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel" DROP CONSTRAINT "FK_33f7b06b2c4e0e128d670526c66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel" DROP CONSTRAINT "FK_803e574fe048adacb88443c8d45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel_document" DROP CONSTRAINT "FK_66430bd7d2b199d4885a0d5a343"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel_document" DROP CONSTRAINT "FK_31dce1c6fcd24fc6bd45824fea5"`,
    );
    await queryRunner.query(`DROP TABLE "portal"."application_parcel"`);
    await queryRunner.query(
      `DROP TABLE "portal"."application_parcel_ownership_type"`,
    );
    await queryRunner.query(
      `DROP TABLE "portal"."application_parcel_document"`,
    );
  }
}
