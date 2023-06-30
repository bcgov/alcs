import { MigrationInterface, QueryRunner } from "typeorm"

export class localGovCorrections1688144882418 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        UPDATE "alcs"."application_local_government" SET "name" = 'Islands Trust Comox Strathcona (Historical)' WHERE "name" = 'Islands Trust- Comox Strathcona (Historical)';
        UPDATE "alcs"."application_local_government" SET "name" = 'Islands Trust Nanaimo (Historical)' WHERE "name" = 'Islands Trust- Nanaimo (Historical)';
        UPDATE "alcs"."application_local_government" SET "name" = 'Islands Trust Capital (Historical)' WHERE "name" = 'Islands Trust-Capital (Historical)';
        UPDATE "alcs"."application_local_government" SET "name" = 'Islands Trust Powell River (Historical)' WHERE "name" = 'Islands Trust-Powell River (Historical)';
        UPDATE "alcs"."application_local_government" SET "name" = 'Islands Trust Sunshine Coast (Historical)' WHERE "name" = 'Islands Trust-Sunshine Coast (Historical)';
        UPDATE "alcs"."application_local_government" SET "name" = 'Islands Trust Cowichan Valley (Historical)' WHERE "name" = 'Islands Trust - Cowichan Valley (Historical)';
        UPDATE "alcs"."application_local_government" SET "name" = 'Northern Rockies (Historical)' WHERE "uuid" = '55f665bc-c91b-4bbb-85c2-39691088b297';
        UPDATE "alcs"."application_local_government" SET "preferred_region_code" = 'NORR' WHERE "uuid" = '55f665bc-c91b-4bbb-85c2-39691088b297';
        UPDATE "alcs"."application" SET "local_government_uuid" = '360b05b3-55d4-4f57-a5ea-e0ffd6125db4' WHERE "local_government_uuid" = '0136a261-6237-4332-ae6a-1c7d7f49f0e8';
        UPDATE "alcs"."notice_of_intent" SET "local_government_uuid" = '360b05b3-55d4-4f57-a5ea-e0ffd6125db4' WHERE "local_government_uuid" = '0136a261-6237-4332-ae6a-1c7d7f49f0e8';
        UPDATE "alcs"."planning_review" SET "local_government_uuid" = '360b05b3-55d4-4f57-a5ea-e0ffd6125db4' WHERE "local_government_uuid" = '0136a261-6237-4332-ae6a-1c7d7f49f0e8';
        UPDATE "alcs"."covenant" SET "local_government_uuid" = '360b05b3-55d4-4f57-a5ea-e0ffd6125db4' WHERE "local_government_uuid" = '0136a261-6237-4332-ae6a-1c7d7f49f0e8';
        DELETE FROM alcs.application_local_government WHERE uuid = '0136a261-6237-4332-ae6a-1c7d7f49f0e8';
        INSERT INTO alcs.application_local_government (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"name",preferred_region_code,bceid_business_guid,is_first_nation,is_active,emails) VALUES
        ('e2540566-52a8-4a3c-b373-58e1744703af',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust Galiano Island (Historical)','ISLR',NULL,false,false,'{}');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //N/A
    }

}
