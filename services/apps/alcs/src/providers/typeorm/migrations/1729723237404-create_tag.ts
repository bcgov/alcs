import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTag1729723237404 implements MigrationInterface {
    name = 'CreateTag1729723237404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "alcs"."tag" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "category_uuid" uuid, CONSTRAINT "PK_d70de2c1e1a3b52adb904028ea2" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."tag" IS 'Tag.'`);
        await queryRunner.query(`ALTER TABLE "alcs"."tag" ADD CONSTRAINT "FK_ff4d55f591b098af8bc6213835c" FOREIGN KEY ("category_uuid") REFERENCES "alcs"."tag_category"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."tag" DROP CONSTRAINT "FK_ff4d55f591b098af8bc6213835c"`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."tag" IS NULL`);
        await queryRunner.query(`DROP TABLE "alcs"."tag"`);
    }

}
