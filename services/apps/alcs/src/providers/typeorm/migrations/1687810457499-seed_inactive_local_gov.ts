import { MigrationInterface, QueryRunner } from "typeorm"

export class seedInactiveLocalGov1687810457499 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
        INSERT INTO alcs.application_local_government (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"name",preferred_region_code,bceid_business_guid,is_first_nation,is_active,emails) VALUES
	 ('4e4619cc-2267-4b70-8315-4c56bf14335b',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for Cariboo','INTR',NULL,false,false,'{}'),
	 ('26bb2b8d-a4ea-4fae-bc54-f77c8a8f55f9',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for Central Kootenay','KOOR',NULL,false,false,'{}'),
	 ('2dab92c0-24c8-4551-99a6-b7a73db9cbc7',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for Central Okanagan','OKAR',NULL,false,false,'{}'),
	 ('3ef6f25c-8b5d-49f4-b6d1-5e167e9252ba',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for East Kootenay','KOOR',NULL,false,false,'{}'),
	 ('8fde1050-463c-4226-acfb-b58263cb2387',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for Fraser Valley','SOUR',NULL,false,false,'{}'),
	 ('befdd035-44cc-4a29-8dc7-c66f2ec6fee6',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for GVRD','SOUR',NULL,false,false,'{}'),
	 ('8a0002dd-5783-4822-8c29-6b60e421e5eb',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for Nanaimo','ISLR',NULL,false,false,'{}'),
	 ('164205f0-b7c2-4cd0-a5ec-7f23c515617b',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for North Okanagan','OKAR',NULL,false,false,'{}'),
	 ('70960e85-252d-41ef-a1d5-6f4026d73fff',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for Okanagan-Similkameen','OKAR',NULL,false,false,'{}'),
	 ('1777e5b5-5520-406d-8b05-05872478f112',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for Fraser-Fort George','NORR',NULL,false,false,'{}'),
	 ('49861428-1e94-4ae0-a7a1-46a333e612ce',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions Columbia Shuswap','OKAR',NULL,false,false,'{}'),
	 ('a1ba516d-3637-42f6-9727-12b6e0d04d8a',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for Capital','ISLR',NULL,false,false,'{}'),
	 ('2e485e96-81c6-4f4d-8b25-bb848da1a994',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for Kitimat-Stikine','NORR',NULL,false,false,'{}'),
	 ('a9193be0-1c2e-4ccd-8f86-7e489c424f68',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for Powell River','ISLR',NULL,false,false,'{}'),
	 ('fb2972f5-b5b7-435a-b667-492028f8beb6',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for Squamish-Lillooet','SOUR',NULL,false,false,'{}'),
	 ('476febec-ca88-4615-810c-fcae936867ef',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for Sunshine','SOUR',NULL,false,false,'{}'),
	 ('f0bd3817-5825-4656-b685-d306ddd1fa70',NULL,NOW(),NULL,'migration_seed',NULL,'Multiple Jurisdictions for Thompson-Nicola','INTR',NULL,false,false,'{}'),
	 ('927ece9d-b4e3-4862-aa85-67539d9abb0d',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust Gabriola Island (Historical)','ISLR',NULL,false,false,'{}'),
	 ('9ff02b37-9046-48c8-aa96-01977fb3d1b9',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust Gambier Island (Historical)','SOUR',NULL,false,false,'{}'),
	 ('d325a7a4-fe68-49b0-9df2-599beb06766e',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust Hornby Island (Historical)','ISLR',NULL,false,false,'{}'),
	 ('9f0bdb45-c212-4aee-8413-3cf3c79e988c',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust Lasqueti Island (Historical)','ISLR',NULL,false,false,'{}'),
	 ('09abf170-fb3d-41c3-9089-247afbe4a711',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust Mayne Island (Historical)','ISLR',NULL,false,false,'{}'),
	 ('13de89f7-1c6b-487c-87c8-d5089195f8c4',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust Pender Island (Historical)','ISLR',NULL,false,false,'{}'),
	 ('c98d1989-8156-4391-84f0-f639b8bed479',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust Quadra Island (Historical)','ISLR',NULL,false,false,'{}'),
	 ('dc0357b1-aacd-45ba-8fa9-0e62cbe88e9f',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust Salt Spring Island (Historical)','ISLR',NULL,false,false,'{}'),
	 ('3890ccf8-94e3-4b9a-9a1c-4d33518e1b5d',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust Saturna Island (Historical)','ISLR',NULL,false,false,'{}'),
	 ('538b895f-f0e1-4388-93cb-9eeb7cfa987e',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust Sidney Island (Historical)','ISLR',NULL,false,false,'{}'),
	 ('88532d18-3059-4720-986a-363d9bce6be0',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust- Comox Strathcona (Historical)','ISLR',NULL,false,false,'{}'),
	 ('4e721d39-09b3-4f9b-ad1f-601a69315808',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust- Nanaimo (Historical)','ISLR',NULL,false,false,'{}'),
	 ('9355bf78-280a-4695-adad-fafa06969c99',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust-Capital (Historical)','ISLR',NULL,false,false,'{}'),
	 ('8017df89-8e71-41c3-bee9-1a48f042e157',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust-Powell River (Historical)','ISLR',NULL,false,false,'{}'),
	 ('26f395a1-44ab-4812-9e0d-f2dbc815859d',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust-Sunshine Coast (Historical)','SOUR',NULL,false,false,'{}'),
	 ('b9056ee1-5ba3-4d7c-9029-2cec57ba75d5',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust - Cowichan Valley (Historical)','ISLR',NULL,false,false,'{}'),
	 ('55f665bc-c91b-4bbb-85c2-39691088b297',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust Bowen Island (Historical)','SOUR',NULL,false,false,'{}'),
	 ('7577c7e9-d65b-4051-a0b1-bc95c462bdc3',NULL,NOW(),NULL,'migration_seed',NULL,'Islands Trust Denman Island (Historical)','ISLR',NULL,false,false,'{}');
     `);
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        //N/A
    }

}
