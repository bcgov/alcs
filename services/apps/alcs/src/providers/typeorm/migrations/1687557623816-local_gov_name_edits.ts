import { MigrationInterface, QueryRunner } from "typeorm"

export class localGovNameEdits1687557623816 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          UPDATE "alcs"."application_local_government" SET "name" = 'Village of Masset' WHERE "name" = 'Village of Massett';
          UPDATE "alcs"."application" SET "local_government_uuid" = '92961db6-b74c-460b-bbad-e285398fa491' WHERE "local_government_uuid" = '33aa1f7d-3b65-4ed5-badf-11dafb0b2789';
          UPDATE "alcs"."notice_of_intent" SET "local_government_uuid" = '92961db6-b74c-460b-bbad-e285398fa491' WHERE "local_government_uuid" = '33aa1f7d-3b65-4ed5-badf-11dafb0b2789';
          DELETE FROM alcs.application_local_government WHERE uuid = '33aa1f7d-3b65-4ed5-badf-11dafb0b2789';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //N/A
    }

}
