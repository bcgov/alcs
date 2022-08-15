import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrations1658160165558 implements MigrationInterface {
  name = 'migrations1658160165558';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "email" character varying NOT NULL, "display_name" character varying NOT NULL, "identity_provider" character varying NOT NULL, "preferred_username" character varying NOT NULL, "name" character varying, "given_name" character varying, "family_name" character varying, "idir_user_guid" character varying, "idir_user_name" character varying, "bceid_guid" character varying, "bceid_user_name" character varying, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_a95e949168be7b7ece1a2382fed" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "body" character varying NOT NULL, "edited" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "application_uuid" uuid NOT NULL, "author_uuid" uuid, CONSTRAINT "PK_e45a9d11ff7a3cf11f6c42107b4" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fbbc6f68cb51279ecde6d12a89" ON "comment" ("application_uuid") `,
    );
    await queryRunner.query(
      `CREATE TABLE "application_decision_maker" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_30a4c71ad819b19d4b06eedec4d" UNIQUE ("code"), CONSTRAINT "UQ_d412190ff326c15a58f6d4008ec" UNIQUE ("description"), CONSTRAINT "PK_a14367bd796b759f907518c5e18" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "application_region" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_805ded031f6340b59f60b6f76f5" UNIQUE ("code"), CONSTRAINT "UQ_cd2aeaf77db9f2e0b50d194aa78" UNIQUE ("description"), CONSTRAINT "PK_8b7f8f8a39a6142e0f7c5ad86f5" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "application_paused" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "start_date" date NOT NULL DEFAULT NOW(), "end_date" date, "application_uuid" uuid NOT NULL, CONSTRAINT "PK_95172cd91291d9e80bbebe2c1d6" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "application_status" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_0c826eba913d2983a4ef7a0af79" UNIQUE ("code"), CONSTRAINT "UQ_ceabbf8054480a33932d3b6bbbc" UNIQUE ("description"), CONSTRAINT "PK_5b6c6dffed9d8dd24903be05473" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "application_type" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, "short_label" character varying NOT NULL, "background_color" character varying NOT NULL, "text_color" character varying NOT NULL, CONSTRAINT "UQ_c11f09867d33ab9bea127b7fa87" UNIQUE ("code"), CONSTRAINT "UQ_a5eabdc27d5f23d654bb51bae24" UNIQUE ("description"), CONSTRAINT "PK_b53229d75c2fe5a617ecbff82f3" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "application" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "file_number" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "applicant" character varying NOT NULL, "assignee_uuid" uuid, "paused" boolean NOT NULL DEFAULT false, "high_priority" boolean NOT NULL DEFAULT false, "status_uuid" uuid NOT NULL DEFAULT 'e6ddd1af-1cb9-4e45-962a-92e8d532b149', "type_uuid" uuid NOT NULL, "decision_maker_uuid" uuid, "region_uuid" uuid, CONSTRAINT "UQ_39c4f5ceb0f5a7a4c819d46a0d5" UNIQUE ("file_number"), CONSTRAINT "PK_71af2cd4dccba665296d4befbfe" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "application_history" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" character varying NOT NULL, "status_uuid" uuid NOT NULL, "application_uuid" uuid, CONSTRAINT "PK_36290500e8ba5aee9a6d88bfd51" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "health_check" ("id" SERIAL NOT NULL, "update_date" bigint NOT NULL DEFAULT '1657753460650', CONSTRAINT "PK_bb6ae6b7bca4235bf4563eaeaad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "holiday_entity" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "day" date NOT NULL, CONSTRAINT "UQ_2e57cf5ca757f846872eaa0584a" UNIQUE ("day"), CONSTRAINT "PK_3f5c0b1b3dd5ee7d6c4bdad36ab" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_f2d86184a78b855225c1395dfd3" FOREIGN KEY ("author_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_fbbc6f68cb51279ecde6d12a890" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_paused" ADD CONSTRAINT "FK_57e39f7c811d07c646fc04e8bdf" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_5b6c6dffed9d8dd24903be05473" FOREIGN KEY ("status_uuid") REFERENCES "application_status"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_b53229d75c2fe5a617ecbff82f3" FOREIGN KEY ("type_uuid") REFERENCES "application_type"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_a14367bd796b759f907518c5e18" FOREIGN KEY ("decision_maker_uuid") REFERENCES "application_decision_maker"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_8b7f8f8a39a6142e0f7c5ad86f5" FOREIGN KEY ("region_uuid") REFERENCES "application_region"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_49d8a9170a71a2e7a9e386c945e" FOREIGN KEY ("assignee_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_history" ADD CONSTRAINT "FK_c207c12131344aa91fe4a48d81b" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_history" DROP CONSTRAINT "FK_c207c12131344aa91fe4a48d81b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_49d8a9170a71a2e7a9e386c945e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_8b7f8f8a39a6142e0f7c5ad86f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_a14367bd796b759f907518c5e18"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_b53229d75c2fe5a617ecbff82f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_5b6c6dffed9d8dd24903be05473"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_paused" DROP CONSTRAINT "FK_57e39f7c811d07c646fc04e8bdf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_fbbc6f68cb51279ecde6d12a890"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_f2d86184a78b855225c1395dfd3"`,
    );
    await queryRunner.query(`DROP TABLE "holiday_entity"`);
    await queryRunner.query(`DROP TABLE "health_check"`);
    await queryRunner.query(`DROP TABLE "application_history"`);
    await queryRunner.query(`DROP TABLE "application"`);
    await queryRunner.query(`DROP TABLE "application_type"`);
    await queryRunner.query(`DROP TABLE "application_status"`);
    await queryRunner.query(`DROP TABLE "application_paused"`);
    await queryRunner.query(`DROP TABLE "application_region"`);
    await queryRunner.query(`DROP TABLE "application_decision_maker"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fbbc6f68cb51279ecde6d12a89"`,
    );
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
