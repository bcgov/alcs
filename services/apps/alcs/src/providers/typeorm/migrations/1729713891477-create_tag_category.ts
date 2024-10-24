import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTagCategory1729713891477 implements MigrationInterface {
    name = 'CreateTagCategory1729713891477'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "alcs"."tag_category" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, CONSTRAINT "PK_ff4d55f591b098af8bc6213835c" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."tag_category" IS 'Tag category.'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON TABLE "alcs"."tag_category" IS NULL`);
        await queryRunner.query(`DROP TABLE "alcs"."tag_category"`);
    }

}
