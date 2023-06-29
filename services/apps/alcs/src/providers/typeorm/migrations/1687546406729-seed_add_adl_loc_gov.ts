import { MigrationInterface, QueryRunner } from "typeorm"

export class seedAddAdlLocGov1687546406729 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        INSERT INTO alcs.application_local_government (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"name",preferred_region_code,bceid_business_guid,is_first_nation,is_active,emails) VALUES
	 ('b8a622d7-66da-4598-9687-2e8727fb2561',NULL,NOW(),NULL,'migration_seed',NULL,'City of Port Alberni','ISLR',NULL,false,true,'{}'),
	 ('18bd941a-7c0f-44fe-9d12-a084d2a5f372',NULL,NOW(),NULL,'migration_seed',NULL,'Village of Port Clements','NORR',NULL,false,true,'{}'),
	 ('0235ecdb-95fc-47f9-b7f6-e05e1e388d5b',NULL,NOW(),NULL,'migration_seed',NULL,'Village of Slocan','KOOR',NULL,false,true,'{}'),
	 ('5b5b05d3-df2e-403c-9cf5-3c52c68ab559',NULL,NOW(),NULL,'migration_seed',NULL,'Village of Cumberland','ISLR',NULL,false,true,'{}'),
	 ('e0684ddf-fa61-47c2-87b3-1c72bed5c365',NULL,NOW(),NULL,'migration_seed',NULL,'District of Fort St. James','NORR',NULL,false,true,'{}'),
	 ('5dc1a21a-a740-402e-a56f-8f6c85991739',NULL,NOW(),NULL,'migration_seed',NULL,'District of Wells','INTR',NULL,false,true,'{}'),
	 ('630ee8b6-6bb0-4357-a1e8-d813c3b89433',NULL,NOW(),NULL,'migration_seed',NULL,'Village of Gold River','ISLR',NULL,false,true,'{}'),
	 ('6c0079df-2647-445f-9718-4433e9761eac',NULL,NOW(),NULL,'migration_seed',NULL,'Village of Canal Flats','KOOR',NULL,false,true,'{}'),
	 ('79c3e16e-fdb9-4bb0-a427-f044a5d4bb95',NULL,NOW(),NULL,'migration_seed',NULL,'District of Hudson''s Hope','NORR',NULL,false,true,'{}'),
	 ('d3f74ba5-0dc3-43ea-a7e2-004882d65c33',NULL,NOW(),NULL,'migration_seed',NULL,'District of Barriere','INTR',NULL,false,true,'{}');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //N/A
    }

}
