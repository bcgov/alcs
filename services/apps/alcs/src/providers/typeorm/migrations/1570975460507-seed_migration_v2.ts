import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedMigrationV21570975460507 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //Holiday Entity
    await queryRunner.query(
      `CREATE TABLE "alcs"."holiday_entity" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "day" date NOT NULL, CONSTRAINT "UQ_2e57cf5ca757f846872eaa0584a" UNIQUE ("day"), CONSTRAINT "PK_3f5c0b1b3dd5ee7d6c4bdad36ab" PRIMARY KEY ("uuid"))`,
    );

    // Decision Outcome Types
    await queryRunner.query(`
      INSERT INTO "alcs"."application_decision_chair_review_outcome_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Reconsider', 'REC', 'Reconsider'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Stay', 'STAY', 'Stay');
    `);

    //Meeting Types
    await queryRunner.query(`
    INSERT INTO "alcs"."application_meeting_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Applicant Meeting', 'AM', 'Applicant Meeting'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Information Request', 'IR', 'Information Request'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Site Visit', 'SV', 'Site Visit');
    `);

    //Modification Outcome Types
    await queryRunner.query(`
    INSERT INTO "alcs"."application_modification_outcome_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Pending', 'PEN', 'Pending'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Proceed', 'PRC', 'Proceed'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Refuse', 'REF', 'Refuse');
    `);

    //Reconsideration Outcome Types
    await queryRunner.query(`
    INSERT INTO "alcs"."application_reconsideration_outcome_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Pending', 'PEN', 'Pending'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Proceed', 'PRC', 'Proceed'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Refuse', 'REF', 'Refuse');
    `);

    //Reconsideration Types
    await queryRunner.query(`
    INSERT INTO "alcs"."application_reconsideration_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
      (NULL, NOW(), NULL, 'migration_seed', NULL, '33', '33', '33'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, '33.1', '33.1', '33.1');
    `);

    //Application Regions
    await queryRunner.query(`
    INSERT INTO "alcs"."application_region" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Interior', 'INTR', 'Interior Region'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Island', 'ISLR', 'Island Region'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Kootenay', 'KOOR', 'Kootenay Region'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'North', 'NORR', 'North Region'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Okanagan', 'OKAR', 'Okanagan Region'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'South Coast', 'SOUR', 'South Coast Region');
    `);

    //Local Governments
    await queryRunner.query(`
    INSERT INTO "alcs"."application_local_government" ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "name", "preferred_region_code") VALUES
      ('001cfdad-bc6e-4d25-9294-1550603da980', NULL, NOW(), NULL, 'migration_seed', NULL, 'Peace River Regional District', 'NORR'),
      ('036e3d84-6ea4-4293-a44d-85a44bbad7c2', NULL, NOW(), NULL, 'migration_seed', NULL, 'Sunshine Coast Regional District', 'SOUR'),
      ('04fef504-a885-43c1-bf75-d284168bb0f0', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Revelstoke', 'OKAR'),
      ('0561b4ab-409f-4382-ac01-4c40dfb5adfa', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Kitimat', 'NORR'),
      ('0a0c9cad-ef11-4b85-a3d9-1d0d055d7e0f', NULL, NOW(), NULL, 'migration_seed', NULL, 'Bulkley-Nechako Regional District', 'NORR'),
      ('0a75d012-ba5a-4783-aa79-c967f0cfaa84', NULL, NOW(), NULL, 'migration_seed', NULL, 'Town of Creston', 'KOOR'),
      ('1549f188-b6a6-4401-92d5-d3a480c74a2d', NULL, NOW(), NULL, 'migration_seed', NULL, 'Thompson Nicola Regional District', 'INTR'),
      ('18305897-b290-4802-b033-bd8d65ed60bf', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Cranbrook', 'KOOR'),
      ('18a00fc6-914c-4655-9b28-635c14e158ba', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Campbell River', 'ISLR'),
      ('1aa6ba16-51e8-4789-8624-67ac30f25636', NULL, NOW(), NULL, 'migration_seed', NULL, 'Okanagan Similkameen Regional District', 'OKAR'),
      ('1b9887fd-617d-4aef-891c-41dd2ad50d4b', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Port Alberni ', 'ISLR'),
      ('1e53098d-917f-4186-b87d-471990b39709', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Enderby', 'OKAR'),
      ('1f57c0a3-a95e-4ad6-a9e8-91d859ad5f7e', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Trail', 'KOOR'),
      ('2627cced-4317-4291-aa17-499e273632cb', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Canal Flats ', 'KOOR'),
      ('27a63e56-447f-49ae-b706-09a78048339a', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Fraser Lake', 'NORR'),
      ('29a7e1ae-ba19-4dda-a7b8-7ae5a0a272d8', NULL, NOW(), NULL, 'migration_seed', NULL, 'North Okanagan Regional District', 'OKAR'),
      ('2a31ee8f-fac1-422a-9b5c-70889e2d8b54', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Grand Forks', 'KOOR'),
      ('2bbacfda-2186-46d2-bf70-f93abd3496e5', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Chetwynd', 'NORR'),
      ('2d778f4d-27a2-4f92-a561-f4b626f6b5d8', NULL, NOW(), NULL, 'migration_seed', NULL, 'Strathcona Regional District', 'ISLR'),
      ('2f21e590-a6ba-46a6-9856-0dcc3298f844', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Harrison Hot Springs', 'SOUR'),
      ('3115b2e5-b038-4292-b238-eadc032de2e7', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Port Coquitlam', 'SOUR'),
      ('311704d0-8db8-4789-90f2-ac15c6437b3f', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Lake Country', 'OKAR'),
      ('33aa1f7d-3b65-4ed5-badf-11dafb0b2789', NULL, NOW(), NULL, 'migration_seed', NULL, 'Northern Rockies Regional Municipality', 'NORR'),
      ('35906d62-8e9a-4170-9666-c21d2e16a506', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Coldstream', 'OKAR'),
      ('35be0556-d281-4f7c-8b0a-8f6cdc202425', NULL, NOW(), NULL, 'migration_seed', NULL, 'Kitimat Stikine Regional District', 'NORR'),
      ('360b05b3-55d4-4f57-a5ea-e0ffd6125db4', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Chase', 'INTR'),
      ('36d16d05-7c5f-4582-a0a4-f967ca36c967', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Fernie', 'KOOR'),
      ('3afaf2ac-75c4-43e4-b841-c6efe07a968c', NULL, NOW(), NULL, 'migration_seed', NULL, 'Town of Comox', 'ISLR'),
      ('400d984c-4c1d-4f02-8e2f-26052009129e', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Radium Hot Springs', 'KOOR'),
      ('437aa538-47ac-4b54-a512-a99ea976ced1', NULL, NOW(), NULL, 'migration_seed', NULL, 'qathet Regional District', 'ISLR'),
      ('4754ed2c-100d-4bba-ac60-6a97232a9a31', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Coquitlam', 'SOUR'),
      ('516876da-c350-4c4a-9379-224633972938', NULL, NOW(), NULL, 'migration_seed', NULL, 'Township of Spallumcheen', 'OKAR'),
      ('51b0522b-b6e3-4d8f-904b-3413b33f936e', NULL, NOW(), NULL, 'migration_seed', NULL, 'Central Coast Regional District', 'INTR'),
      ('55a22292-f03b-4447-ba16-44ef223ebcf8', NULL, NOW(), NULL, 'migration_seed', NULL, 'Tla''amin Nation', 'ISLR'),
      ('56b23565-88bb-48cc-8a70-806e515ba119', NULL, NOW(), NULL, 'migration_seed', NULL, 'Town of View Royal', 'ISLR'),
      ('597a183d-e958-468c-ac4d-b62affe1594a', NULL, NOW(), NULL, 'migration_seed', NULL, 'Islands Trust', 'ISLR'),
      ('5a5b3fff-f341-40aa-9377-08c52d5e1def', NULL, NOW(), NULL, 'migration_seed', NULL, 'Town of Qualicum Beach', 'ISLR'),
      ('5ca6cd49-989a-430c-8805-a45a7c95bc71', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Lillooet', 'SOUR'),
      ('5ea6dd81-1273-4f6d-9466-15b810c0feb0', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Clearwater', 'INTR'),
      ('5f144a91-b3f7-458e-872b-30eb8ddc06a8', NULL, NOW(), NULL, 'migration_seed', NULL, 'Fraser Fort George Regional District', 'NORR'),
      ('614c63a6-599f-4c3e-bd51-43a0be5eaecd', NULL, NOW(), NULL, 'migration_seed', NULL, 'Columbia Shuswap Regional District', 'OKAR'),
      ('636cddf2-9327-4d4b-b706-f4fe474d7ac2', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Sparwood', 'KOOR'),
      ('66ce1d6b-669f-40b5-9363-10632e28b561', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Cache Creek', 'INTR'),
      ('692b797a-d4a3-4c02-b60d-6f7c559665d8', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Prince George', 'NORR'),
      ('693e3cfa-ce7f-43b4-8952-a4b02bb273f1', NULL, NOW(), NULL, 'migration_seed', NULL, 'Comox Valley Regional District', 'ISLR'),
      ('6ae6b9be-bc36-4f9e-a5ce-02766dd3354d', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Oak Bay', 'ISLR'),
      ('6b0d5e6b-69f7-4287-a941-a1abc99cdd04', NULL, NOW(), NULL, 'migration_seed', NULL, 'Fraser Valley Regional District', 'SOUR'),
      ('6e5da7c6-9a72-44c5-8b8d-690439fb7cd1', NULL, NOW(), NULL, 'migration_seed', NULL, 'Bowen Island (Island Municipality)', 'SOUR'),
      ('6f980e43-e430-4d73-a3ba-785aabbc6b5e', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Lumby', 'OKAR'),
      ('6ffacf25-cb64-4cb6-a83d-85b9ac985305', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of New Hazelton', 'NORR'),
      ('711abc78-f1fc-4b47-8533-63b6ba26c0a9', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Houston', 'NORR'),
      ('71dfa376-1bfc-4e0f-a753-b65e594be1e5', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Sechelt', 'SOUR'),
      ('72853310-ca48-4f7c-b879-2e1a446f458e', NULL, NOW(), NULL, 'migration_seed', NULL, 'Township of Esquimalt', 'ISLR'),
      ('72a9c8c8-28cb-4b08-b79a-8afebabdd327', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Burnaby', 'SOUR'),
      ('759e64d5-e55e-42c1-8a4f-91849bfd93dd', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Elkford', 'KOOR'),
      ('773a4edc-7af3-4dcb-b9ae-28bea98099a1', NULL, NOW(), NULL, 'migration_seed', NULL, 'Cariboo Regional District', 'INTR'),
      ('77dfc810-beb6-4c46-85c8-ae88febc1e3f', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Squamish', 'SOUR'),
      ('7b120741-df1e-4ac2-83eb-0b126ad5fd16', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Taylor', 'NORR'),
      ('7b95a58c-1f9c-41a5-9a59-82d73443e0f2', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Invermere', 'KOOR'),
      ('7cf5792b-f6b6-45f8-b3a1-f2e20d140e8b', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Castlegar', 'KOOR'),
      ('7d2a7a18-2e2e-4a45-a3d3-0543652810e4', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Powell River', 'SOUR'),
      ('7f29504d-69b2-4c09-bf53-5fad59fb05b0', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Ashcroft', 'INTR'),
      ('7fcd0a40-2a99-436a-968a-f77f6ebf1f85', NULL, NOW(), NULL, 'migration_seed', NULL, 'North Coast Regional District', 'NORR'),
      ('80315291-8987-4979-b4df-0a5fa300f64b', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Pouce Coupe', 'NORR'),
      ('81ace6dd-e590-4a45-80f1-50c592a4985e', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Port Clements ', 'NORR'),
      ('825f2ecf-fac1-467c-a96c-7b29473073b3', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Langley', 'SOUR'),
      ('8358f7d3-a457-48fe-9530-8b579bd0c91d', NULL, NOW(), NULL, 'migration_seed', NULL, 'Town of Sidney', 'ISLR'),
      ('87b7e1f6-4946-4714-a7c9-c4777058d2a5', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Pemberton', 'SOUR'),
      ('884bc103-5191-4c67-988b-5ebb074cf5d5', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Nakusp', 'KOOR'),
      ('8c834efa-9c33-4f46-a2c7-b0cfdedece04', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Maple Ridge', 'SOUR'),
      ('8cc35f6b-bd3f-4985-8bca-7607889de964', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Saanich', 'ISLR'),
      ('8d2378a8-edef-4b04-8b13-8aa67603f4f5', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Dawson Creek', 'NORR'),
      ('8d450fec-c5c2-489a-a363-4621f7d0b72b', NULL, NOW(), NULL, 'migration_seed', NULL, 'Tsawwassen First Nation', 'SOUR'),
      ('8db386a1-93a6-4848-8b49-68af04464bc8', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of North Cowichan', 'ISLR'),
      ('8eaa02e6-fd7d-4f51-89f7-b881b8137fa2', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of 100 Mile House', 'INTR'),
      ('919716db-c316-4ae5-92ab-74b0a4e5e3b6', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Summerland', 'OKAR'),
      ('92961db6-b74c-460b-bbad-e285398fa491', NULL, NOW(), NULL, 'migration_seed', NULL, 'Northern Rockies Regional Municipality', 'NORR'),
      ('94b6b354-01f3-4285-9e30-b653a5b24b4c', NULL, NOW(), NULL, 'migration_seed', NULL, 'Nisga''a Nation', 'NORR'),
      ('961e2cf5-1508-4775-80c4-164f1199585d', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Richmond', 'SOUR'),
      ('97ddbb1a-45a0-4d60-ac14-d07db8c76a92', NULL, NOW(), NULL, 'migration_seed', NULL, 'Town of Princeton', 'OKAR'),
      ('991b9a44-01bb-459b-8b92-115ca49af99f', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Sooke', 'ISLR'),
      ('9b190453-9b88-4cba-94f9-70fd81432a12', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Parksville', 'ISLR'),
      ('9ba3ab3d-b830-4d2e-89bf-d6b9b472a482', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Logan Lake', 'INTR'),
      ('9bdfe6d2-95b2-4684-9d5a-797f1fabcd55', NULL, NOW(), NULL, 'migration_seed', NULL, 'Town of Ladysmith', 'ISLR'),
      ('9da89a5c-9a27-4371-8e60-d93a4c85e4a9', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Pitt Meadows', 'SOUR'),
      ('9fda6054-e4e5-4fcb-9752-174abc8ee9ea', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Penticton', 'OKAR'),
      ('a1457f58-7566-4222-acb1-8b7fdeb27810', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of North Saanich', 'ISLR'),
      ('a1bdd9cd-fd63-46a8-a925-f38f81a3b5a1', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Peachland', 'OKAR'),
      ('a2978d25-77e9-481b-9f84-726894b4570f', NULL, NOW(), NULL, 'migration_seed', NULL, 'Town of Gibsons', 'SOUR'),
      ('a2b58d4e-44a0-4221-be6a-93d16ab04500', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Colwood', 'ISLR'),
      ('a3e3dd07-9efa-4a01-ac38-5dafa43911c3', NULL, NOW(), NULL, 'migration_seed', NULL, 'East Kootenay Regional District', 'KOOR'),
      ('a610d04a-fe9a-44e9-8125-b9378312e482', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Sayward', 'ISLR'),
      ('a6ae4789-3fa5-463f-90a3-68295d4a83ab', NULL, NOW(), NULL, 'migration_seed', NULL, 'Town of Oliver', 'OKAR'),
      ('a7e16ffa-a218-4f8c-9695-9642a9987e3b', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Barriere ', 'INTR'),
      ('aafd74f6-bbe5-4728-aa13-e9be9e6f077b', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Rossland', 'KOOR'),
      ('abfe022f-64f2-472b-b312-afc0c9ae7e8f', NULL, NOW(), NULL, 'migration_seed', NULL, 'Cowichan Valley Regional District', 'ISLR'),
      ('ac411bf2-66b3-401d-9155-27f3026bbed3', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Kamloops', 'INTR'),
      ('afaa920f-7cd3-43c3-a7a1-bcd77b4a2af0', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Nanaimo', 'ISLR'),
      ('afb8feab-5604-4257-95cc-bd036251e387', NULL, NOW(), NULL, 'migration_seed', NULL, 'Town of Lake Cowichan', 'ISLR'),
      ('b0d9e0fe-742e-4158-a9c5-3e06e9a42145', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Metchosin', 'ISLR'),
      ('b17f2d87-2952-409d-a0d7-5cbbb76a11f5', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Hope', 'SOUR'),
      ('b2883559-a22c-49dc-b6f7-20fe9117d085', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Salmon Arm', 'OKAR'),
      ('b30fcb96-d5c5-498c-933c-22563f25b606', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Abbotsford', 'SOUR'),
      ('b3da6e71-6759-494b-a5fe-8ef7a3ce66da', NULL, NOW(), NULL, 'migration_seed', NULL, 'Town of Smithers', 'NORR'),
      ('b7f954a4-9c8f-4eaa-9ec2-3416a6c08587', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Telkwa', 'NORR'),
      ('b898a19a-ff20-4c31-8cbf-52f6ec533e98', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Kimberley', 'KOOR'),
      ('b89df1ef-9b1d-494e-8387-b1ba6abaf637', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Fort St. James ', 'NORR'),
      ('b9195d80-81b4-42c5-9047-e1a1a00a04f0', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Courtenay', 'ISLR'),
      ('ba21a867-8a74-4364-95b9-4c3648591ba4', NULL, NOW(), NULL, 'migration_seed', NULL, 'Squamish Lillooet Regional District', 'SOUR'),
      ('ba5bd974-ad17-48cf-ab1c-55abfa91c291', NULL, NOW(), NULL, 'migration_seed', NULL, 'Nanaimo Regional District', 'ISLR'),
      ('beb93bee-6c60-404b-979b-2567a1a34492', NULL, NOW(), NULL, 'migration_seed', NULL, 'Capital Regional District', 'ISLR'),
      ('bf0306ad-d710-4898-b84c-cd44ccb77f41', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Greenwood', 'KOOR'),
      ('bf6277e3-ad02-418f-bc0b-c61db4a3e469', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Kent', 'SOUR'),
      ('c180bc79-c78b-4c58-91a6-aa3e92408d15', NULL, NOW(), NULL, 'migration_seed', NULL, 'Central Okanagan Regional District', 'OKAR'),
      ('c438ec9e-8446-4b15-a794-629da2330bb8', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Langford', 'ISLR'),
      ('c4ddce75-e3bb-4b8d-87a2-a199fe31d665', NULL, NOW(), NULL, 'migration_seed', NULL, 'Kootenay Boundary Regional District', 'KOOR'),
      ('c53df262-b1ed-4160-88d9-7eb668608ae6', NULL, NOW(), NULL, 'migration_seed', NULL, 'Town of Golden', 'OKAR'),
      ('c6109982-ec0c-4624-91d7-77c4405bbf71', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Central Saanich', 'ISLR'),
      ('c75a9264-bde4-4ff3-b101-9992fc088d0a', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Clinton', 'INTR'),
      ('c7e91940-0d7a-4cc8-8beb-c5471cc257c5', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Midway', 'KOOR'),
      ('c908a8ef-f3ce-4e7d-bb02-49f5a272404c', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Salmo', 'KOOR'),
      ('cc7cebbb-d126-46bb-8a7a-6936f20ddce9', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Kelowna', 'OKAR'),
      ('cd124d44-4eaf-455f-8027-2e54a4a9b551', NULL, NOW(), NULL, 'migration_seed', NULL, 'Mount Waddington Regional District', 'ISLR'),
      ('cea7033d-f36d-42c1-bc2a-77e25c189436', NULL, NOW(), NULL, 'migration_seed', NULL, 'Township of Langley', 'SOUR'),
      ('cf727428-c2c7-4478-8924-6b8d41570a17', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Chilliwack', 'SOUR'),
      ('d0572d4c-d422-4761-aba1-7718c978bff0', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Sicamous', 'OKAR'),
      ('d4a9a573-749b-45df-bef9-9e5435807144', NULL, NOW(), NULL, 'migration_seed', NULL, 'Town of Osoyoos', 'OKAR'),
      ('d551b854-e698-4ae5-b2bb-172eadd62ce2', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Fort St. John', 'NORR'),
      ('d5636832-75e1-4f64-ad25-046a3cf594a2', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of West Kelowna', 'OKAR'),
      ('d57ff5bc-5715-4017-ab5c-fa8d00334bec', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Merritt', 'INTR'),
      ('d9d9545b-748a-46da-85d4-fee20c0fb124', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Mission', 'SOUR'),
      ('dd81e07c-499d-4416-bdfa-2a70f08302ce', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Surrey', 'SOUR'),
      ('de39716c-a867-4403-86da-bb6b05a34908', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Vancouver', 'SOUR'),
      ('df19457c-4511-4104-bc85-9675412a6359', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Hudson’s Hope', 'NORR'),
      ('df1dea47-66e3-48ef-925f-d6f7ac40f688', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Lantzville', 'ISLR'),
      ('e30d6777-1345-4f63-9e63-bc7bbad5067a', NULL, NOW(), NULL, 'migration_seed', NULL, 'Metro Vancouver Regional District', 'SOUR'),
      ('e4b0f43c-7c7d-47cd-af05-24b6313d80b0', NULL, NOW(), NULL, 'migration_seed', NULL, 'Alberni-Clayoquot Regional District', 'ISLR'),
      ('eb9a3858-b065-46cf-8bf7-73cdb5b6c2f7', NULL, NOW(), NULL, 'migration_seed', NULL, 'Central Kootenay Regional District', 'KOOR'),
      ('ebccc81f-57d9-4b7e-9c49-ce78f0451fbf', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Williams Lake', 'INTR'),
      ('ecd19993-2104-4511-9c19-a9e1f1307e0f', NULL, NOW(), NULL, 'migration_seed', NULL, 'District of Vanderhoof', 'NORR'),
      ('ede8bbcf-6543-4719-922d-f40a60c22a34', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Terrace', 'NORR'),
      ('f0400ec6-9560-4ce7-a4e0-4370984ec97d', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Keremeos', 'OKAR'),
      ('f1db2dca-61f5-46ac-819c-2c5575b007c9', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Delta', 'SOUR'),
      ('f5a82219-a82f-4418-9dc2-0a147e5a31bf', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of Massett', 'NORR'),
      ('f625fb10-c89e-49ac-afac-41b50e7ad3c3', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Vernon', 'OKAR'),
      ('f6c2a40c-c9a3-46c3-9e7c-365b455f6717', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Quesnel', 'INTR'),
      ('f9364f76-10bb-4036-9f0f-9e497e71c06f', NULL, NOW(), NULL, 'migration_seed', NULL, 'City of Armstrong', 'OKAR'),
      ('ffeb6ba2-e5f3-4fa1-b588-210dd5136505', NULL, NOW(), NULL, 'migration_seed', NULL, 'Village of McBride', 'NORR');
    `);

    //Application Types
    await queryRunner.query(`
    INSERT INTO "alcs"."application_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "short_label", "background_color", "text_color", "html_description", "portal_label") VALUES
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Exclusion', 'EXCL', 'Exclusion Permit', 'EXC', '#dc1017', '#fff', '', ''),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Inclusion', 'INCL', 'Inclusion Permit', 'INC', '#ffadbf', '#000', '', ''),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Non-Adhering Residential Use', 'NARU', 'Non-Adhering Residential Use', 'NARU', '#228820', '#fff', '', ''),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Non-Farm Use', 'NFUP', 'Non-Farm Use Permit', 'NFU', '#ff9800', '#000', 'Choose this option if you are proposing to conduct a non-farm use on ALR land under
            <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02036_01#section20">Section 20(2) of the Agricultural Land Commission Act</a>.
            If your proposal relates to the placement of fill and/or theremoval of soil, please consider the soil and/or fill application types above.
            ', 'Non-Farm Uses within the ALR'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Placement of Fill/Removal of Soil', 'PFRS', 'Placement of Fill and Removal of Soil', 'SOIL', '#084299', '#fff', '', ''),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Placement of Fill', 'POFO', 'Placement of Fill Only', 'SOIL', '#084299', '#fff', '', ''),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Removal of Soil', 'ROSO', 'Removal of Soil Only', 'SOIL', '#084299', '#fff', '', ''),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Subdivison', 'SUBD', 'Subdivision Permit', 'SD', '#ffeb3b', '#000', '', ''),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Transportation, Utility, or Recreational Trail', 'TURP', 'Transportation, Utility, Trail Permits', 'TUR', '#c12bdb', '#fff', 'Choose this option if you are proposing one of the following uses on ALR land under
            <a target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/57_2020#section22">Section 22 of the Agricultural Land Reserve General Regulation</a>:
            <ul>
             <li>construction for the purpose of widening an existing road right of way;</li>
             <li>construction of a road within an existing right of way;</li>
             <li>construction of any of the following:
              <ul>
                  <li>a new or existing road or railway;</li>
                  <li>a new or existing recreational trail;</li>
                  <li>a utility corridor use;</li>
                  <li>a sewer or water line other than for ancillary utility connections;</li>
                  <li>a forest service road under the Forest Act;</li>
              </ul>
              <li>the new use of an existing right of way for a recreational trail;</li>
            </ul>
            ', 'Transportation, Utility, or Recreational Trail Uses within the ALR');
    `);

    //Boards
    await queryRunner.query(`
    INSERT INTO "alcs"."board" ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "code", "title", "decision_maker") VALUES
      ('30a432ce-fd7b-40fd-9b6e-4d9df305b57f', NULL, NOW(), NULL, 'migration_seed', NULL, 'film', 'Film Panel', 'Film Panel'),
      ('325b6f2f-5612-47cb-b039-d934b180f417', NULL, NOW(), NULL, 'migration_seed', NULL, 'island', 'Island Panel', 'Island Panel'),
      ('46a8294f-27fd-477e-a722-50121d907bb1', NULL, NOW(), NULL, 'migration_seed', NULL, 'inte', 'Interior Panel', 'Interior Panel'),
      ('76fb47cf-7695-4a6e-8c71-c25a255cbcae', NULL, NOW(), NULL, 'migration_seed', NULL, 'soil', 'Soil & Fill Panel', 'Soil & Fill Panel'),
      ('88fefa0b-98db-4cb4-af42-17f169f1c7ed', NULL, NOW(), NULL, 'migration_seed', NULL, 'okan', 'Okanagan Panel', 'Okanagan Panel'),
      ('93b54e2c-6c1f-4fae-8cff-2b49da223dd2', NULL, NOW(), NULL, 'migration_seed', NULL, 'koot', 'Kootenay Panel', 'Kootenay Panel'),
      ('978bb70a-dbea-4285-9165-91efb141d619', NULL, NOW(), NULL, 'migration_seed', NULL, 'north', 'North Panel', 'North Panel'),
      ('b31621ec-2d65-4d9a-be76-d05a49bd5ebf', NULL, NOW(), NULL, 'migration_seed', NULL, 'south', 'South Coast Panel', 'South Coast Panel'),
      ('b3b483b6-becd-43c2-92ed-b02e1864f039', NULL, NOW(), NULL, 'migration_seed', NULL, 'ceo', 'CEO', 'CEO'),
      ('bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', NULL, NOW(), NULL, 'migration_seed', NULL, 'vett', 'Vetting', 'Unassigned'),
      ('d8c18278-cb41-474e-a180-534a101243ab', NULL, NOW(), NULL, 'migration_seed', NULL, 'exec', 'Executive Committee', 'Executive Committee');
    `);

    //Card Statuses
    await queryRunner.query(`
      INSERT INTO "alcs"."card_status" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Acknowledged Complete', 'ACKC', 'App is complete and ready for LUPs'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Acknowledged Incomplete', 'ACKI', 'App is incomplete and requires fixes by Applicant'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Application Ready for Review', 'APPR', 'CEO Board Only, application is ready for review'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Cancelled Applications', 'CNCL', 'Application has been cancelled'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Decision Review', 'DECR', 'CEO Board only, decision is ready for review'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Decision Signed-off', 'DECS', 'CEO Board only, decision is reviewed and signed off'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Drafting Decision', 'DRAF', 'Meeting completed and decision letter is being drafted'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Incoming / Prelim Review', 'INCO', 'Application is under preliminary review'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Manager Draft Review', 'MANA', 'Decision letter is drafted and waiting for review'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Site Visit Scheduled / Applicant&nbsp;Meeting', 'MEET', 'Site visit or meeting scheduled with applicant'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Pending Commissioner Sign&#8209;Off', 'PEND', 'Decision letter has completed review and waiting commissioner sign off'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'App&nbsp;Prelim&nbsp;Done / To&nbsp;Be&nbsp;Assigned&nbsp;to&nbsp;LUP', 'PREL', 'Preliminary review complete, ready to be assigned'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Application Prep', 'PREP', 'Preparation is in progress'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Ready&nbsp;for&nbsp;Review&nbsp;Sent / Going&nbsp;to&nbsp;Next&nbsp;Review&nbsp;Discussion', 'READ', 'Report is ready to be reviewed by panel in a meeting'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Decision Released', 'RELE', 'Decision letter has been posted and ready for review'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Staff Report Review', 'STAF', 'Report is ready for review by staff'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Submitted to ALC', 'SUBM', 'Submitted from ALC Portal'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'To Be Vetted', 'VETT', 'To be Vetted by App Specialist');
    `);

    //Link Board -> Card Status
    await queryRunner.query(`
    INSERT INTO "alcs"."board_status" ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "order", "board_uuid", "status_code") VALUES
      ('013e0cc7-b113-4829-8e51-98ca2597c5d5', NULL, NOW(), NULL, 'migration_seed', NULL, 2, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'PREP'),
      ('0485110d-b13c-47e6-bf82-cca406e6b8fb', NULL, NOW(), NULL, 'migration_seed', NULL, 3, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'MEET'),
      ('07c2ac86-8f31-4e37-b7ef-a0f8c04fb262', NULL, NOW(), NULL, 'migration_seed', NULL, 1, '325b6f2f-5612-47cb-b039-d934b180f417', 'PREL'),
      ('07ca948d-83da-4d6e-9d34-d5d6e8f132c2', NULL, NOW(), NULL, 'migration_seed', NULL, 0, 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'SUBM'),
      ('08f8b113-8ed9-4efe-86d0-f68b0b1952c7', NULL, NOW(), NULL, 'migration_seed', NULL, 6, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'DRAF'),
      ('091459c4-931c-4deb-8917-c960f5e07685', NULL, NOW(), NULL, 'migration_seed', NULL, 3, '325b6f2f-5612-47cb-b039-d934b180f417', 'MEET'),
      ('09672640-08f5-4e5f-beb2-a35a76b2c4c2', NULL, NOW(), NULL, 'migration_seed', NULL, 5, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'READ'),
      ('0d0ae9eb-ffba-4f31-8074-a4dae0e543a4', NULL, NOW(), NULL, 'migration_seed', NULL, 4, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'STAF'),
      ('0e2d486b-6a61-4948-a1c5-3572a0826f58', NULL, NOW(), NULL, 'migration_seed', NULL, 5, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'READ'),
      ('0ee54e74-bfde-4d97-bcc6-1763118a9f8e', NULL, NOW(), NULL, 'migration_seed', NULL, 8, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'PEND'),
      ('141417d3-edc6-4970-be0e-bcfc75baa7a1', NULL, NOW(), NULL, 'migration_seed', NULL, 9, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'RELE'),
      ('17ec92e1-11ce-478e-a23d-d82ec9f2b169', NULL, NOW(), NULL, 'migration_seed', NULL, 4, '978bb70a-dbea-4285-9165-91efb141d619', 'STAF'),
      ('182c9b5c-8211-40bc-8300-b6ace35f8d79', NULL, NOW(), NULL, 'migration_seed', NULL, 1, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'PREL'),
      ('18baafa5-6f6f-43c0-b54b-62ac1d85e6fe', NULL, NOW(), NULL, 'migration_seed', NULL, 0, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'INCO'),
      ('19210962-33ea-497f-9537-168b6e61cae2', NULL, NOW(), NULL, 'migration_seed', NULL, 9, 'd8c18278-cb41-474e-a180-534a101243ab', 'RELE'),
      ('1bed6ce9-a5e2-404e-a138-39ebed17e549', NULL, NOW(), NULL, 'migration_seed', NULL, 7, '46a8294f-27fd-477e-a722-50121d907bb1', 'MANA'),
      ('1d6314f9-0108-4258-980f-09c379139e4b', NULL, NOW(), NULL, 'migration_seed', NULL, 6, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'DRAF'),
      ('2467ced0-8321-4c91-9876-937f090b2c8b', NULL, NOW(), NULL, 'migration_seed', NULL, 4, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'STAF'),
      ('257ecdad-3d8a-4ed8-a54c-bd89415878df', NULL, NOW(), NULL, 'migration_seed', NULL, 8, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'PEND'),
      ('258ccc7d-7bd7-4253-a7bc-c8e733b78554', NULL, NOW(), NULL, 'migration_seed', NULL, 1, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'PREL'),
      ('273a34fc-43ab-4c2a-8515-e50c73de2930', NULL, NOW(), NULL, 'migration_seed', NULL, 8, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'PEND'),
      ('28c000a7-86f4-4320-93d3-798a9d746eac', NULL, NOW(), NULL, 'migration_seed', NULL, 8, '46a8294f-27fd-477e-a722-50121d907bb1', 'PEND'),
      ('2b7f8365-a4ac-4843-9edc-a4c0cb4d0cb1', NULL, NOW(), NULL, 'migration_seed', NULL, 7, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'MANA'),
      ('30e46f26-286e-47bd-99aa-211a21d6e0d2', NULL, NOW(), NULL, 'migration_seed', NULL, 5, '46a8294f-27fd-477e-a722-50121d907bb1', 'READ'),
      ('31f70855-7e41-4a2f-9189-6c191ae8ff68', NULL, NOW(), NULL, 'migration_seed', NULL, 4, '46a8294f-27fd-477e-a722-50121d907bb1', 'STAF'),
      ('35e5ac5e-06e4-4ff1-ae8b-cc02f6fa456d', NULL, NOW(), NULL, 'migration_seed', NULL, 7, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'MANA'),
      ('372b8a3a-317e-4e49-a2f2-38050565e5ee', NULL, NOW(), NULL, 'migration_seed', NULL, 10, '46a8294f-27fd-477e-a722-50121d907bb1', 'CNCL'),
      ('3e56a21f-231e-4a15-9ab1-33c073f95567', NULL, NOW(), NULL, 'migration_seed', NULL, 2, '978bb70a-dbea-4285-9165-91efb141d619', 'PREP'),
      ('434c1e84-256a-46b0-b898-67d4695df816', NULL, NOW(), NULL, 'migration_seed', NULL, 9, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'RELE'),
      ('4558a54b-85fd-4775-b491-f557a5600c63', NULL, NOW(), NULL, 'migration_seed', NULL, 2, '325b6f2f-5612-47cb-b039-d934b180f417', 'PREP'),
      ('46a0575c-8c37-4054-a539-29bee08edc7b', NULL, NOW(), NULL, 'migration_seed', NULL, 2, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'PREP'),
      ('46c410c0-ca8e-4a07-bb75-d4739246d467', NULL, NOW(), NULL, 'migration_seed', NULL, 5, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'APPR'),
      ('4801f07f-1fe1-47bd-9975-c2027957b80a', NULL, NOW(), NULL, 'migration_seed', NULL, 4, '325b6f2f-5612-47cb-b039-d934b180f417', 'STAF'),
      ('4b1acd56-b49e-4541-a0fa-5269e53ffd66', NULL, NOW(), NULL, 'migration_seed', NULL, 5, '978bb70a-dbea-4285-9165-91efb141d619', 'READ'),
      ('4b7e6bff-65dc-4405-ba33-f4bf0a3d6eb4', NULL, NOW(), NULL, 'migration_seed', NULL, 10, 'd8c18278-cb41-474e-a180-534a101243ab', 'CNCL'),
      ('4f060803-4b3d-48af-8630-99c26a3f30be', NULL, NOW(), NULL, 'migration_seed', NULL, 2, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'PREP'),
      ('56791dc7-a4f7-474f-909a-72873af8cfbf', NULL, NOW(), NULL, 'migration_seed', NULL, 7, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'MANA'),
      ('5822efb5-06a2-4432-8b37-f3655c234265', NULL, NOW(), NULL, 'migration_seed', NULL, 6, '978bb70a-dbea-4285-9165-91efb141d619', 'DRAF'),
      ('597ee5f3-cbae-4a2f-ad69-1f8275165994', NULL, NOW(), NULL, 'migration_seed', NULL, 2, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'PREP'),
      ('5ad09014-67f5-4906-b443-b82a5b9e4bde', NULL, NOW(), NULL, 'migration_seed', NULL, 7, '978bb70a-dbea-4285-9165-91efb141d619', 'MANA'),
      ('5b4ddf3e-0aef-4d30-badc-ebce2626c2ba', NULL, NOW(), NULL, 'migration_seed', NULL, 6, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'DRAF'),
      ('5c29bae3-1455-4598-9ddd-f7ef5a17abb7', NULL, NOW(), NULL, 'migration_seed', NULL, 3, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'MEET'),
      ('5dfd7979-e35d-4420-b574-99306168bf35', NULL, NOW(), NULL, 'migration_seed', NULL, 5, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'READ'),
      ('5ec82801-8f9d-447f-aa92-8f7c59bc0d65', NULL, NOW(), NULL, 'migration_seed', NULL, 10, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'CNCL'),
      ('5fb5818b-7f07-4f25-ba3f-57077c8e8df7', NULL, NOW(), NULL, 'migration_seed', NULL, 1, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'PREL'),
      ('60b00e80-310c-4144-b36e-daebe3cd8a4d', NULL, NOW(), NULL, 'migration_seed', NULL, 10, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'CNCL'),
      ('60cf2897-eaca-401c-b7d8-a5c88a6d49fe', NULL, NOW(), NULL, 'migration_seed', NULL, 2, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'PREP'),
      ('611b8614-38a9-4db5-bd08-52ecc567e2d0', NULL, NOW(), NULL, 'migration_seed', NULL, 8, '325b6f2f-5612-47cb-b039-d934b180f417', 'PEND'),
      ('630b5c64-be0e-49c9-98f0-bb3231c291f6', NULL, NOW(), NULL, 'migration_seed', NULL, 1, 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'VETT'),
      ('6380baf4-9087-4e88-9562-2715b1e16b21', NULL, NOW(), NULL, 'migration_seed', NULL, 4, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'STAF'),
      ('72c2aa25-6f3d-4463-8f5a-0cd1a5545012', NULL, NOW(), NULL, 'migration_seed', NULL, 8, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'PEND'),
      ('77450351-2ec9-4165-844b-404872b05f8d', NULL, NOW(), NULL, 'migration_seed', NULL, 6, 'd8c18278-cb41-474e-a180-534a101243ab', 'DRAF'),
      ('7882190c-1800-4d7f-beb6-2805e654704c', NULL, NOW(), NULL, 'migration_seed', NULL, 0, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'INCO'),
      ('7936eba2-39f5-4ad3-aa23-b2dd9999e45d', NULL, NOW(), NULL, 'migration_seed', NULL, 0, '46a8294f-27fd-477e-a722-50121d907bb1', 'INCO'),
      ('7a2f993c-2522-4a42-9732-36a72fdab75b', NULL, NOW(), NULL, 'migration_seed', NULL, 0, 'd8c18278-cb41-474e-a180-534a101243ab', 'INCO'),
      ('7f44942d-8f77-4c28-a686-307ff31e0e53', NULL, NOW(), NULL, 'migration_seed', NULL, 4, 'd8c18278-cb41-474e-a180-534a101243ab', 'STAF'),
      ('838a534c-de4d-4cf1-b4c2-f6f3a13fd8fd', NULL, NOW(), NULL, 'migration_seed', NULL, 5, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'READ'),
      ('847cc2c6-48ff-4959-811c-40a05b94bf1d', NULL, NOW(), NULL, 'migration_seed', NULL, 3, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'MEET'),
      ('87e428b9-e0bd-45e1-a7af-d028eb873f54', NULL, NOW(), NULL, 'migration_seed', NULL, 3, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'MEET'),
      ('886e0989-7589-45bd-854a-24ed7e1818c2', NULL, NOW(), NULL, 'migration_seed', NULL, 2, '46a8294f-27fd-477e-a722-50121d907bb1', 'PREP'),
      ('8ca8ecfe-fc16-4040-b4dd-c0c7aa1f4ee4', NULL, NOW(), NULL, 'migration_seed', NULL, 8, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'DECS'),
      ('8ec2cc49-1058-422f-8c5d-f6e5a5f4927a', NULL, NOW(), NULL, 'migration_seed', NULL, 8, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'PEND'),
      ('92099395-ad2d-4bb2-9031-a16e3e41a041', NULL, NOW(), NULL, 'migration_seed', NULL, 5, 'd8c18278-cb41-474e-a180-534a101243ab', 'READ'),
      ('961c7b73-293b-41d5-84ad-8154dc756979', NULL, NOW(), NULL, 'migration_seed', NULL, 1, 'd8c18278-cb41-474e-a180-534a101243ab', 'PREL'),
      ('9a621995-7705-4370-8ec5-f75b73c97790', NULL, NOW(), NULL, 'migration_seed', NULL, 8, 'd8c18278-cb41-474e-a180-534a101243ab', 'PEND'),
      ('a3e33ebd-f308-4434-baf0-9d881261c0d7', NULL, NOW(), NULL, 'migration_seed', NULL, 7, 'd8c18278-cb41-474e-a180-534a101243ab', 'MANA'),
      ('a4622031-899d-4919-b519-096adf26734e', NULL, NOW(), NULL, 'migration_seed', NULL, 3, '978bb70a-dbea-4285-9165-91efb141d619', 'MEET'),
      ('a52aab73-9a55-40bb-889e-82e9c305bb94', NULL, NOW(), NULL, 'migration_seed', NULL, 5, '325b6f2f-5612-47cb-b039-d934b180f417', 'READ'),
      ('a7b88520-a0cb-49a0-8cfe-5bb8fd174810', NULL, NOW(), NULL, 'migration_seed', NULL, 4, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'STAF'),
      ('aaa8d432-eca0-449d-bb19-7bf9af7777f5', NULL, NOW(), NULL, 'migration_seed', NULL, 9, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'RELE'),
      ('aacc9499-07e0-4ede-baa0-cc5f5ce79b82', NULL, NOW(), NULL, 'migration_seed', NULL, 2, 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'ACKI'),
      ('acf82ed5-1136-4c5d-8302-fdabec12482d', NULL, NOW(), NULL, 'migration_seed', NULL, 3, 'd8c18278-cb41-474e-a180-534a101243ab', 'MEET'),
      ('b1f10d3f-d095-4e63-bc0d-3cf83053cd8c', NULL, NOW(), NULL, 'migration_seed', NULL, 3, 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'ACKC'),
      ('b2b2e768-a76b-4d42-8422-4ef563b3130d', NULL, NOW(), NULL, 'migration_seed', NULL, 4, 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'CNCL'),
      ('b5172a09-e7d3-4b20-874b-af204cb90d86', NULL, NOW(), NULL, 'migration_seed', NULL, 6, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'DRAF'),
      ('b5b2b838-d9fa-44f1-b819-53f857d34050', NULL, NOW(), NULL, 'migration_seed', NULL, 8, '978bb70a-dbea-4285-9165-91efb141d619', 'PEND'),
      ('b68e16d1-0e53-4b38-98b6-5b2bf7894d0b', NULL, NOW(), NULL, 'migration_seed', NULL, 7, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'MANA'),
      ('baf786ce-b37d-44fc-9709-d9e8e5dc4258', NULL, NOW(), NULL, 'migration_seed', NULL, 9, '325b6f2f-5612-47cb-b039-d934b180f417', 'RELE'),
      ('bd17ec5b-742c-4362-980a-dd545af49597', NULL, NOW(), NULL, 'migration_seed', NULL, 1, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'PREL'),
      ('bd6a82a0-a64a-492a-abeb-8a6aa5e7f03c', NULL, NOW(), NULL, 'migration_seed', NULL, 3, '46a8294f-27fd-477e-a722-50121d907bb1', 'MEET'),
      ('be2b5103-786e-4fc6-a9ec-b9b32e1a1bdf', NULL, NOW(), NULL, 'migration_seed', NULL, 10, '978bb70a-dbea-4285-9165-91efb141d619', 'CNCL'),
      ('bff922b9-9f35-4429-8a6d-8bb1b15323b3', NULL, NOW(), NULL, 'migration_seed', NULL, 0, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'INCO'),
      ('c0dd213e-e225-4da8-9c09-b95477d518dc', NULL, NOW(), NULL, 'migration_seed', NULL, 1, '978bb70a-dbea-4285-9165-91efb141d619', 'PREL'),
      ('c25ba942-dd1e-4f88-9b8b-ad0e45f19dba', NULL, NOW(), NULL, 'migration_seed', NULL, 9, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'RELE'),
      ('c2b41262-c4f3-4e7b-b5a5-0a747b504501', NULL, NOW(), NULL, 'migration_seed', NULL, 10, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'CNCL'),
      ('c52c4fe3-1a39-4904-ac5f-ba05ba9a74b3', NULL, NOW(), NULL, 'migration_seed', NULL, 9, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'RELE'),
      ('c6c02844-5059-4ab2-abde-7bc46865230e', NULL, NOW(), NULL, 'migration_seed', NULL, 9, '46a8294f-27fd-477e-a722-50121d907bb1', 'RELE'),
      ('c845158a-63ed-47dd-962b-4266ddf68df2', NULL, NOW(), NULL, 'migration_seed', NULL, 1, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'PREL'),
      ('c9ccbf3c-3cc7-4b97-9454-8cd0d8dee357', NULL, NOW(), NULL, 'migration_seed', NULL, 10, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'CNCL'),
      ('d1857a80-0dbd-4662-b927-2fc084e756e7', NULL, NOW(), NULL, 'migration_seed', NULL, 1, '46a8294f-27fd-477e-a722-50121d907bb1', 'PREL'),
      ('d2150e74-55b8-48a5-86c5-579d1856ade2', NULL, NOW(), NULL, 'migration_seed', NULL, 2, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'PREP'),
      ('d2d62c76-59c9-4819-bee7-eeb22ac8561c', NULL, NOW(), NULL, 'migration_seed', NULL, 0, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'INCO'),
      ('d8c3e142-21a1-458b-8e74-9daf81d40f5f', NULL, NOW(), NULL, 'migration_seed', NULL, 10, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'CNCL'),
      ('d9f93ead-caa4-4df3-92e4-39c2162c7a60', NULL, NOW(), NULL, 'migration_seed', NULL, 6, '46a8294f-27fd-477e-a722-50121d907bb1', 'DRAF'),
      ('db14a919-2e2b-499e-91cb-1a697326993b', NULL, NOW(), NULL, 'migration_seed', NULL, 6, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'DRAF'),
      ('dcdb0bc2-7a28-40d6-a8fc-895ce6570198', NULL, NOW(), NULL, 'migration_seed', NULL, 6, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'DRAF'),
      ('ddddd9da-469d-44a2-af06-2745200fded7', NULL, NOW(), NULL, 'migration_seed', NULL, 4, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'STAF'),
      ('deb409fc-0bfa-4f87-be88-e3d357cde8b7', NULL, NOW(), NULL, 'migration_seed', NULL, 10, '325b6f2f-5612-47cb-b039-d934b180f417', 'CNCL'),
      ('ea12b13a-e36b-423d-8b11-6b8ed17b8fda', NULL, NOW(), NULL, 'migration_seed', NULL, 0, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'INCO'),
      ('eb35ecf7-1b40-4bc3-8c46-c6ad5843c672', NULL, NOW(), NULL, 'migration_seed', NULL, 9, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'RELE'),
      ('eb957d95-d3b8-4c1f-9252-84aa5c5db89f', NULL, NOW(), NULL, 'migration_seed', NULL, 5, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'READ'),
      ('edc3f59e-fe77-4c3a-8341-230101090686', NULL, NOW(), NULL, 'migration_seed', NULL, 10, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'CNCL'),
      ('ee28674a-8094-48d3-87c1-a6507506f1dc', NULL, NOW(), NULL, 'migration_seed', NULL, 2, 'd8c18278-cb41-474e-a180-534a101243ab', 'PREP'),
      ('ef4ac782-0c16-4d9e-b845-d308922ddca2', NULL, NOW(), NULL, 'migration_seed', NULL, 0, '978bb70a-dbea-4285-9165-91efb141d619', 'INCO'),
      ('f0773b93-336c-4d17-8874-5e1d96b63b11', NULL, NOW(), NULL, 'migration_seed', NULL, 3, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'MEET'),
      ('f0e02f02-4829-434e-807a-06ddd1de2ff9', NULL, NOW(), NULL, 'migration_seed', NULL, 4, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'STAF'),
      ('f279216d-2ad9-47e7-97a7-8c193d78a9cd', NULL, NOW(), NULL, 'migration_seed', NULL, 0, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'INCO'),
      ('f649726b-18ad-4d12-8db3-f1c9d29dc72b', NULL, NOW(), NULL, 'migration_seed', NULL, 0, '325b6f2f-5612-47cb-b039-d934b180f417', 'INCO'),
      ('f9f64c14-4131-4bbb-9209-d98a9e11a3c9', NULL, NOW(), NULL, 'migration_seed', NULL, 1, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'PREL'),
      ('fa25e656-57c1-4fc3-9f28-f730c263b2dc', NULL, NOW(), NULL, 'migration_seed', NULL, 7, '325b6f2f-5612-47cb-b039-d934b180f417', 'MANA'),
      ('fd3600b1-9d6a-4e4a-be83-5318e2a1bfa5', NULL, NOW(), NULL, 'migration_seed', NULL, 6, '325b6f2f-5612-47cb-b039-d934b180f417', 'DRAF'),
      ('fe02e3fb-c979-4d75-9db5-e6a5647feaad', NULL, NOW(), NULL, 'migration_seed', NULL, 7, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'MANA'),
      ('fe782792-2d13-4d9e-8cd8-d470e031a31a', NULL, NOW(), NULL, 'migration_seed', NULL, 7, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'DECR'),
      ('ff7cf0fc-cef3-4e24-b1cd-ed704707501d', NULL, NOW(), NULL, 'migration_seed', NULL, 9, '978bb70a-dbea-4285-9165-91efb141d619', 'RELE');
    `);

    //Subtask Types
    await queryRunner.query(`
    INSERT INTO "alcs"."card_subtask_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "code", "background_color", "text_color", "label", "description") VALUES
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'AUDT', '#FEE9B5', '#C08106', 'Audit', 'Audit'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'GIS', '#A7C7E8', '#002447', 'GIS', 'GIS');
    `);

    //Card Types
    await queryRunner.query(`
    INSERT INTO "alcs"."card_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Application', 'APP', 'Application type card'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Covenant', 'COV', 'Card type for Conservation Covenants'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Modification', 'MODI', 'Modification type card'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Planning Review', 'PLAN', 'Card type for Executive Committee planning reviews'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Reconsideration', 'RECON', 'Reconsideration type card');
    `);

    //Ceo Criterion Codes
    await queryRunner.query(`
    INSERT INTO "alcs"."ceo_criterion_code" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "number") VALUES
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Boundary adjustment', 'BOUN', 'Boundary adjustment', 7),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Build new residence while occupying existing residence', 'BUIL', 'Build new residence while occupying existing residence', 17),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Application consistent with ALC Planning Decision', 'CONS', 'Application consistent with ALC Planning Decision', 1),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Filming in the ALR', 'FILM', 'Filming in the ALR', 18),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Fulfill requirement of previous ALC Decision', 'FULF', 'Fulfill requirement of previous ALC Decision', 2),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Homesite severance', 'HOME', 'Homesite severance', 12),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Linear transportation and utility use (excluding recreational trails)', 'LINT', 'Linear transportation and utility use (excluding recreational trails)', 4),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Minor deviation from permitted uses', 'MIND', 'Minor deviation from permitted uses', 3),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Applications that are minor in nature', 'MINO', 'Applications that are minor in nature', 14),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Condition modification', 'MODI', 'Condition modification', 8),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Place portable classroom or expand playing field of existing school', 'PORT', 'Place portable classroom or expand playing field of existing school', 16),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Temporary farm worker housing', 'TEMP', 'Temporary farm worker housing', 15);
    `);

    //Decision Makers
    await queryRunner.query(`
    INSERT INTO "alcs"."decision_maker_code" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'CEO', 'CEOP', 'CEO'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Executive Committee', 'EXEC', 'Executive Committee'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Film Panel', 'FILM', 'Film Panel'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Interior Panel', 'INTE', 'Interior Panel'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Island Panel', 'ISLE', 'Island Panel'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Kootenay Panel', 'KOOT', 'Kootenay Panel'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'North Panel', 'NORT', 'North Panel'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Okanagan Panel', 'OKAN', 'Okanagan Panel'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Soil & Fill Panel', 'SOIL', 'Soil & Fill Panel'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'South Coast Panel', 'SOUT', 'South Coast Panel');
    `);

    //Decision Outcomes
    await queryRunner.query(`
    INSERT INTO "alcs"."decision_outcome_code" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "is_first_decision") VALUES
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Approved Alternate', 'APPA', 'Decision was Approved Alternated', 't'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Approved', 'APPR', 'Decision was Approved', 't'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Confirm', 'CONF', 'Decision confirms previous resolution', 'f'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Refused', 'REFU', 'Decision was Refused', 't'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Reverse', 'REVE', 'Decision reverses the previous resolution', 'f'),
      (NULL, NOW(), NULL, 'migration_seed', NULL, 'Vary', 'VARY', 'Decision varies the previous resolution', 'f');
    `);

    //Holidays
    await queryRunner.query(`
    INSERT INTO "alcs"."holiday_entity" ("uuid", "name", "day") VALUES
      ('e71d372a-1ed5-4a9f-968b-313c1ef5ad94', '', '2016-01-01'),
      ('d9286bf5-53ca-456b-9651-e0a247e28a0e', '', '2016-02-08'),
      ('bababeb4-80a5-4ee4-b1c7-73393fdc9b30', '', '2016-03-25'),
      ('178dcf75-735c-4e6e-9a17-6fd1c24041e4', '', '2016-03-28'),
      ('24fb03c2-babc-482a-ae63-c57db2888b0e', '', '2016-05-23'),
      ('fe0056d3-a5a9-4775-82d5-9f77d8d3bb42', '', '2016-07-01'),
      ('59239022-5e8b-4fcf-ac41-044543012aa2', '', '2016-08-01'),
      ('4eff0439-f06f-419c-9856-e60b7309cc57', '', '2016-09-05'),
      ('36612c16-6443-4042-9e24-527bfb149df8', '', '2016-10-10'),
      ('015e7daf-9fc2-436e-b32b-208dd88229f8', '', '2016-11-11'),
      ('6e54db1b-ff1d-4067-bdcb-db2c4d5616af', '', '2016-12-26'),
      ('9292d136-0d67-447d-89a0-9576f6c5df2c', '', '2016-12-27'),
      ('a3604977-7cfe-49d8-88c4-4204ddbf03c9', '', '2017-01-02'),
      ('0f973606-a9d9-4a84-86f9-ff0ba221fbce', '', '2017-02-13'),
      ('5d6fd8e9-cc5a-465d-a095-f593258d57ab', '', '2017-04-14'),
      ('561bbb67-957d-46be-9dd7-633eab3c0fee', '', '2017-04-17'),
      ('610c1372-acaf-4801-8707-e69ebce1eeb6', '', '2017-05-22'),
      ('853a8253-9441-4b99-954d-cfa5e5209ed1', '', '2017-07-03'),
      ('36bee364-f0b4-4284-a8c2-d214cdf08d9c', '', '2017-08-07'),
      ('e848aa49-c144-4855-9305-ad8b58691649', '', '2017-09-04'),
      ('f9e4f367-eba2-47ec-b660-0bccb1b052d2', '', '2017-10-09'),
      ('f0252859-cbe4-42a8-bc92-8b0e823a4e03', '', '2017-11-13'),
      ('8cff952c-3960-48a9-8109-7814a0fbdc36', '', '2017-12-25'),
      ('11ba87b7-e918-4824-8cf7-56af3f701291', '', '2017-12-26'),
      ('aa17c201-b348-40ba-b220-08df1099fd22', '', '2018-01-01'),
      ('be9cd7aa-4cc3-443b-bee2-4fbd90722833', '', '2018-02-12'),
      ('b28dafcf-f0c5-4820-815d-4bb97c5def9a', '', '2018-03-30'),
      ('b71e76b3-bc3f-454c-baa1-4aee5e37de52', '', '2018-04-02'),
      ('17d79012-47f2-4015-9dc2-e213a3d09706', '', '2018-05-21'),
      ('99200f23-6c87-4727-b7c9-fdda4d2ce15d', '', '2018-07-02'),
      ('f4c5b61a-1807-4a47-aeff-6c3e44d81964', '', '2018-08-06'),
      ('e123b67b-d058-4262-b8a9-d4ce3ea3ef73', '', '2018-09-03'),
      ('2c090d2a-4b4f-4d56-882b-338edcd7526e', '', '2018-10-08'),
      ('92724e77-1a8c-4c4f-9619-7e10a339fe2c', '', '2018-11-12'),
      ('d6ce051f-5da4-4414-b821-e328612b29e1', '', '2018-12-25'),
      ('15d3a2b8-735b-4c4a-a27c-f829211f008c', '', '2018-12-26'),
      ('648819ec-f47e-4ccf-9c0e-f36b424d7ffa', '', '2019-01-01'),
      ('0a69e43a-bce8-47fa-a317-9072a4306b4b', '', '2019-02-18'),
      ('77020850-96d9-4017-ba45-7b6db0269970', '', '2019-04-19'),
      ('b1976252-b49c-46f2-ac36-17907da47f07', '', '2019-04-22'),
      ('11a1a8a9-3838-41fa-a949-538957c4a95b', '', '2019-05-20'),
      ('67a6414b-ccf4-4b1b-a429-717e48226ff3', '', '2019-07-01'),
      ('4c91e3ba-fd76-445e-b595-f746f55f4d90', '', '2019-08-05'),
      ('f1da6c4a-5168-4f54-afaf-49d103be7a8e', '', '2019-09-02'),
      ('e26aff65-7c5f-4667-b89d-6442adf3af0e', '', '2019-10-14'),
      ('beceaa14-64de-4a97-acf5-c30f3a0ae783', '', '2019-11-11'),
      ('6bcdd614-967b-45c5-8481-ca8fdbe94da4', '', '2019-12-25'),
      ('6b29c79d-a560-4379-99bc-117086e6d582', '', '2019-12-26'),
      ('09aad008-0937-4768-97bb-fc9210eb83aa', 'New Year''s Day', '2020-01-01'),
      ('89986018-872f-4ccf-812c-f1cd227743b9', 'Family Day', '2020-02-17'),
      ('3f396914-cb2b-4d68-ac07-ca2daa26bfe4', 'Good Friday', '2020-04-10'),
      ('a657858d-8990-464a-94d8-5b969a1a7ba4', 'Easter Monday', '2020-04-13'),
      ('33ae383b-4b48-43e5-a37d-95706167cb87', 'Victoria Day', '2020-05-18'),
      ('0616d5de-d860-4c33-b5f3-6274b49cbac3', 'Canada Day', '2020-07-01'),
      ('34a38920-e332-4372-b8a3-08c2a999e6c6', 'BC Day', '2020-08-03'),
      ('b99a89e8-ed3d-44c7-95e1-59119d6e4f7e', 'Labour Day', '2020-09-07'),
      ('c3b0ee68-d16b-4677-a2a9-cbf958510325', 'Thanksgiving Day', '2020-10-12'),
      ('75d26345-9d8c-420a-8f4f-e4f276b4e316', 'Remembrance Day', '2020-11-11'),
      ('6ef85263-ec88-43ab-9021-5502dcf386f1', 'Christmas Day', '2020-12-25'),
      ('f2a5c5b3-f700-495f-a979-06cb1fe88bf9', 'Boxing Day', '2020-12-28'),
      ('2ff655ff-ca03-4511-b465-8558eebaa337', 'New Year''s Day', '2021-01-01'),
      ('a91c7520-598f-4b93-afbe-ad722814bc03', 'Family Day', '2021-02-15'),
      ('3db98e3b-5a88-427d-b2a6-2c3344607a35', 'Good Friday', '2021-04-02'),
      ('c40a4747-0a98-46c9-b1d4-00219f5532f7', 'Easter Monday', '2021-04-05'),
      ('8a072939-776a-4c6b-93fc-a5819c7366b2', 'Victoria Day', '2021-05-24'),
      ('e89439fa-5227-46fa-ab02-29a28dcac66b', 'Canada Day', '2021-07-01'),
      ('3d740989-2f7b-458d-9a60-98a853087806', 'BC Day', '2021-08-02'),
      ('7447ba72-6a17-4090-9a01-a693b244ee36', 'Labour Day', '2021-09-06'),
      ('37104396-91e6-4e83-9b0c-ab69e7708e20', 'National Truth and Reconciliation Day', '2021-09-30'),
      ('14d30053-c337-4274-a41e-28c7e480040c', 'Thanksgiving Day', '2021-10-11'),
      ('8e3e8d50-2b71-4eb7-921f-b20b828d6182', 'Remembrance Day', '2021-11-11'),
      ('db76e2b6-5109-4b6c-b39e-0a63588ce546', 'Christmas Day', '2021-12-27'),
      ('56876a49-0e2a-4b29-8b5d-5c50f3b0ee9e', 'Boxing Day', '2021-12-28'),
      ('481649cb-9b7b-4df2-ab87-0e66a08095bb', 'New Year''s Day', '2022-01-03'),
      ('42b1d17f-8170-4e2d-9902-544f829fb92c', 'Family Day', '2022-02-21'),
      ('852f7de8-7b0e-4d49-9e1d-11061a7e4a57', 'Good Friday', '2022-04-15'),
      ('78eb7c2d-f588-4360-b24a-40fba537c305', 'Easter Monday', '2022-04-18'),
      ('0108485e-0c0f-40c8-b193-d85aeca40278', 'Victoria Day', '2022-05-23'),
      ('f1e7110d-2575-4738-bed0-fbbc0dcfe66c', 'Canada Day', '2022-07-01'),
      ('c8886d10-6698-456e-9e4b-4289a154ddf0', 'BC Day', '2022-08-01'),
      ('d6903a10-6673-4cb7-bb05-e4bd65d67dbc', 'Labour Day', '2022-09-05'),
      ('64b68abe-d499-418a-8cd6-4a5b9680a71a', 'Queens Funeral Day', '2022-09-19'),
      ('e2942d3c-ba45-4d33-9945-f1472c7c3587', 'National Truth and Reconciliation Day', '2022-09-30'),
      ('1d746d0d-272d-48ba-8ce6-fa5f1063988a', 'Thanksgiving Day', '2022-10-10'),
      ('6934c527-f3c2-4a1b-ab54-7730cdc6a2a9', 'Remembrance Day', '2022-11-11'),
      ('3481464d-11d2-4809-8b6f-d18bcb56f444', 'Christmas Day', '2022-12-26'),
      ('7f47eb7a-8dd8-4598-a43a-918a61a42f80', 'Boxing Day', '2022-12-27'),
      ('3d935205-71e0-4442-bb86-26f9106cffa4', 'New Year''s Day', '2023-01-02'),
      ('0aad7b52-37d1-4f53-bf1e-de6976391c4b', 'Family Day', '2023-02-20'),
      ('aad0b662-e5ba-41c4-a10e-e4bb1ff34d5c', 'Good Friday', '2023-04-07'),
      ('a2a8080f-5e0e-4890-8f68-a32b52f4001c', 'Easter Monday', '2023-04-10'),
      ('d3555d7d-48dd-4745-a55e-e5474247ac6f', 'Victoria Day', '2023-05-22'),
      ('bf16fd46-ca31-4178-b444-31ac0845ab70', 'Canada Day', '2023-07-03'),
      ('7fc76f7c-3c51-4d42-b518-542f509847fc', 'BC Day', '2023-08-07'),
      ('fb2b425f-0404-401b-aa72-ce1c8720de1a', 'Labour Day', '2023-09-04'),
      ('1c8c6f7c-78a9-4b5c-afbb-06ab449defd3', 'National Truth and Reconciliation Day', '2023-10-02'),
      ('600ce282-a652-40d3-a4e6-0319d883a286', 'Thanksgiving Day', '2023-10-09'),
      ('d403a6d0-be46-4e34-8e8f-e77f558b02cc', 'Remembrance Day', '2023-11-13'),
      ('838524f2-6c2a-416d-9d14-a5d46919c652', 'Christmas Day', '2023-12-25'),
      ('878406d8-3f0f-475d-a745-206b9144869c', 'Boxing Day', '2023-12-26');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //Not supported
  }
}
