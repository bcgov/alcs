import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCAndESubmitter1749769849869 implements MigrationInterface {
    name = 'AddCAndESubmitter1749769849869'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "alcs"."compliance_and_enforcement_submitter" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "date_added" TIMESTAMP WITH TIME ZONE, "is_anonymous" boolean NOT NULL DEFAULT false, "name" text NOT NULL DEFAULT '', "email" text NOT NULL DEFAULT '', "telephone_number" text NOT NULL DEFAULT '', "affiliation" text NOT NULL DEFAULT '', "additional_contact_information" text NOT NULL DEFAULT '', "file_uuid" uuid, CONSTRAINT "PK_d66d3d2470f550e8cc54a294e29" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_submitter" IS 'Compliance and enforcement submitter'`);
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_submitter" ADD CONSTRAINT "FK_206d3b2431e2a677f9b067aad2d" FOREIGN KEY ("file_uuid") REFERENCES "alcs"."compliance_and_enforcement"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."compliance_and_enforcement_submitter" DROP CONSTRAINT "FK_206d3b2431e2a677f9b067aad2d"`);
        await queryRunner.query(`COMMENT ON TABLE "alcs"."compliance_and_enforcement_submitter" IS NULL`);
        await queryRunner.query(`DROP TABLE "alcs"."compliance_and_enforcement_submitter"`);
    }

}
