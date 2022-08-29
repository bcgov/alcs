import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedBoards1661374006988 implements MigrationInterface {
  name = 'seedBoards1661374006988';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "public"."board"
        ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "code", "title", "decision_maker") VALUES
        ('30a432ce-fd7b-40fd-9b6e-4d9df305b57f', NULL, '2022-08-24 20:49:58.829832+00', '2022-08-24 20:49:58.829832+00', 'alcs-api', NULL, 'film', 'Film Panel', 'Film Panel'),
        ('325b6f2f-5612-47cb-b039-d934b180f417', NULL, '2022-08-24 20:49:58.829832+00', '2022-08-24 20:49:58.829832+00', 'alcs-api', NULL, 'island', 'Island Panel', 'Island Panel'),
        ('46a8294f-27fd-477e-a722-50121d907bb1', NULL, '2022-08-24 20:49:58.829832+00', '2022-08-24 20:49:58.829832+00', 'alcs-api', NULL, 'inte', 'Interior Panel', 'Interior Panel'),
        ('76fb47cf-7695-4a6e-8c71-c25a255cbcae', NULL, '2022-08-24 20:49:58.829832+00', '2022-08-24 20:49:58.829832+00', 'alcs-api', NULL, 'soil', 'Soil & Fill Panel', 'Soil & Fill Panel'),
        ('88fefa0b-98db-4cb4-af42-17f169f1c7ed', NULL, '2022-08-24 20:49:58.829832+00', '2022-08-24 20:49:58.829832+00', 'alcs-api', NULL, 'okan', 'Okanagan Panel', 'Okanagan Panel'),
        ('93b54e2c-6c1f-4fae-8cff-2b49da223dd2', NULL, '2022-08-24 20:49:58.829832+00', '2022-08-24 20:49:58.829832+00', 'alcs-api', NULL, 'koot', 'Kootenay Panel', 'Kootenay Panel'),
        ('978bb70a-dbea-4285-9165-91efb141d619', NULL, '2022-08-24 20:49:58.829832+00', '2022-08-24 20:49:58.829832+00', 'alcs-api', NULL, 'north', 'North Panel', 'North Panel'),
        ('b31621ec-2d65-4d9a-be76-d05a49bd5ebf', NULL, '2022-08-24 20:49:58.829832+00', '2022-08-24 20:49:58.829832+00', 'alcs-api', NULL, 'south', 'South Coast Panel', 'South Coast Panel'),
        ('b3b483b6-becd-43c2-92ed-b02e1864f039', NULL, '2022-08-24 20:49:58.829832+00', '2022-08-24 20:49:58.829832+00', 'alcs-api', NULL, 'ceo', 'CEO', 'CEO'),
        ('bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', NULL, '2022-08-24 20:49:58.829832+00', '2022-08-24 20:49:58.829832+00', 'alcs-api', NULL, 'vett', 'Vetting', 'Unassigned'),
        ('d8c18278-cb41-474e-a180-534a101243ab', NULL, '2022-08-24 20:49:58.829832+00', '2022-08-24 20:49:58.829832+00', 'alcs-api', NULL, 'exec', 'Executive Committee', 'Executive Committee');
    `);

    await queryRunner.query(`
          INSERT INTO "public"."board_status"
          --- Film
          ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "order", "board_uuid", "status_uuid") VALUES
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 0, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'e6ddd1af-1cb9-4e45-962a-92e8d532b149'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 1, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'fac4b88a-9c1a-41f4-885c-408ba6c095ec'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 2, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'b9fc6416-95c3-40f9-9d32-5e7e3d1231b9'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 3, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'aa5bb0f3-8e50-479c-8c99-105a6d3e2565'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 4, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', '42384f47-d6d1-4b5e-ad9c-a66fc754dd52'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 5, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', '64944bb8-f2f2-4709-9062-214f5c4d3187'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 6, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', '5f233a50-97ec-44d3-af56-309f0cdeb29d'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 7, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'f784320d-57bb-4021-bdca-203923c34dbe'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 8, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', '1c70dd1f-4373-4999-818e-bffcaaa7f30b'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 9, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'ddc41949-f3b7-40b0-88d3-d9f649836cd5'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 10, '30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'b11c03b2-826a-4fbe-a469-f9c5768cf2c8'),
          
          --- Island
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 0, '325b6f2f-5612-47cb-b039-d934b180f417', 'e6ddd1af-1cb9-4e45-962a-92e8d532b149'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 1, '325b6f2f-5612-47cb-b039-d934b180f417', 'fac4b88a-9c1a-41f4-885c-408ba6c095ec'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 2, '325b6f2f-5612-47cb-b039-d934b180f417', 'b9fc6416-95c3-40f9-9d32-5e7e3d1231b9'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 3, '325b6f2f-5612-47cb-b039-d934b180f417', 'aa5bb0f3-8e50-479c-8c99-105a6d3e2565'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 4, '325b6f2f-5612-47cb-b039-d934b180f417', '42384f47-d6d1-4b5e-ad9c-a66fc754dd52'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 5, '325b6f2f-5612-47cb-b039-d934b180f417', '64944bb8-f2f2-4709-9062-214f5c4d3187'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 6, '325b6f2f-5612-47cb-b039-d934b180f417', '5f233a50-97ec-44d3-af56-309f0cdeb29d'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 7, '325b6f2f-5612-47cb-b039-d934b180f417', 'f784320d-57bb-4021-bdca-203923c34dbe'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 8, '325b6f2f-5612-47cb-b039-d934b180f417', '1c70dd1f-4373-4999-818e-bffcaaa7f30b'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 9, '325b6f2f-5612-47cb-b039-d934b180f417', 'ddc41949-f3b7-40b0-88d3-d9f649836cd5'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 10, '325b6f2f-5612-47cb-b039-d934b180f417', 'b11c03b2-826a-4fbe-a469-f9c5768cf2c8'),
          
          --- Interior
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 0, '46a8294f-27fd-477e-a722-50121d907bb1', 'e6ddd1af-1cb9-4e45-962a-92e8d532b149'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 1, '46a8294f-27fd-477e-a722-50121d907bb1', 'fac4b88a-9c1a-41f4-885c-408ba6c095ec'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 2, '46a8294f-27fd-477e-a722-50121d907bb1', 'b9fc6416-95c3-40f9-9d32-5e7e3d1231b9'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 3, '46a8294f-27fd-477e-a722-50121d907bb1', 'aa5bb0f3-8e50-479c-8c99-105a6d3e2565'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 4, '46a8294f-27fd-477e-a722-50121d907bb1', '42384f47-d6d1-4b5e-ad9c-a66fc754dd52'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 5, '46a8294f-27fd-477e-a722-50121d907bb1', '64944bb8-f2f2-4709-9062-214f5c4d3187'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 6, '46a8294f-27fd-477e-a722-50121d907bb1', '5f233a50-97ec-44d3-af56-309f0cdeb29d'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 7, '46a8294f-27fd-477e-a722-50121d907bb1', 'f784320d-57bb-4021-bdca-203923c34dbe'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 8, '46a8294f-27fd-477e-a722-50121d907bb1', '1c70dd1f-4373-4999-818e-bffcaaa7f30b'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 9, '46a8294f-27fd-477e-a722-50121d907bb1', 'ddc41949-f3b7-40b0-88d3-d9f649836cd5'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 10, '46a8294f-27fd-477e-a722-50121d907bb1', 'b11c03b2-826a-4fbe-a469-f9c5768cf2c8'),
          
          --- Soil
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 0, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'e6ddd1af-1cb9-4e45-962a-92e8d532b149'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 1, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'fac4b88a-9c1a-41f4-885c-408ba6c095ec'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 2, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'b9fc6416-95c3-40f9-9d32-5e7e3d1231b9'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 3, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'aa5bb0f3-8e50-479c-8c99-105a6d3e2565'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 4, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', '42384f47-d6d1-4b5e-ad9c-a66fc754dd52'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 5, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', '64944bb8-f2f2-4709-9062-214f5c4d3187'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 6, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', '5f233a50-97ec-44d3-af56-309f0cdeb29d'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 7, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'f784320d-57bb-4021-bdca-203923c34dbe'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 8, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', '1c70dd1f-4373-4999-818e-bffcaaa7f30b'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 9, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'ddc41949-f3b7-40b0-88d3-d9f649836cd5'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 10, '76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'b11c03b2-826a-4fbe-a469-f9c5768cf2c8'),
          
          --- Okanagan
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 0, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'e6ddd1af-1cb9-4e45-962a-92e8d532b149'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 1, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'fac4b88a-9c1a-41f4-885c-408ba6c095ec'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 2, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'b9fc6416-95c3-40f9-9d32-5e7e3d1231b9'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 3, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'aa5bb0f3-8e50-479c-8c99-105a6d3e2565'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 4, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', '42384f47-d6d1-4b5e-ad9c-a66fc754dd52'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 5, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', '64944bb8-f2f2-4709-9062-214f5c4d3187'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 6, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', '5f233a50-97ec-44d3-af56-309f0cdeb29d'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 7, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'f784320d-57bb-4021-bdca-203923c34dbe'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 8, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', '1c70dd1f-4373-4999-818e-bffcaaa7f30b'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 9, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'ddc41949-f3b7-40b0-88d3-d9f649836cd5'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 10, '88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'b11c03b2-826a-4fbe-a469-f9c5768cf2c8'),
          
          --- Kootenay
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 0, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'e6ddd1af-1cb9-4e45-962a-92e8d532b149'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 1, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'fac4b88a-9c1a-41f4-885c-408ba6c095ec'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 2, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'b9fc6416-95c3-40f9-9d32-5e7e3d1231b9'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 3, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'aa5bb0f3-8e50-479c-8c99-105a6d3e2565'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 4, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', '42384f47-d6d1-4b5e-ad9c-a66fc754dd52'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 5, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', '64944bb8-f2f2-4709-9062-214f5c4d3187'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 6, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', '5f233a50-97ec-44d3-af56-309f0cdeb29d'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 7, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'f784320d-57bb-4021-bdca-203923c34dbe'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 8, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', '1c70dd1f-4373-4999-818e-bffcaaa7f30b'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 9, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'ddc41949-f3b7-40b0-88d3-d9f649836cd5'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 10, '93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'b11c03b2-826a-4fbe-a469-f9c5768cf2c8'),
          
          --- North Panel
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 0, '978bb70a-dbea-4285-9165-91efb141d619', 'e6ddd1af-1cb9-4e45-962a-92e8d532b149'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 1, '978bb70a-dbea-4285-9165-91efb141d619', 'fac4b88a-9c1a-41f4-885c-408ba6c095ec'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 2, '978bb70a-dbea-4285-9165-91efb141d619', 'b9fc6416-95c3-40f9-9d32-5e7e3d1231b9'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 3, '978bb70a-dbea-4285-9165-91efb141d619', 'aa5bb0f3-8e50-479c-8c99-105a6d3e2565'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 4, '978bb70a-dbea-4285-9165-91efb141d619', '42384f47-d6d1-4b5e-ad9c-a66fc754dd52'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 5, '978bb70a-dbea-4285-9165-91efb141d619', '64944bb8-f2f2-4709-9062-214f5c4d3187'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 6, '978bb70a-dbea-4285-9165-91efb141d619', '5f233a50-97ec-44d3-af56-309f0cdeb29d'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 7, '978bb70a-dbea-4285-9165-91efb141d619', 'f784320d-57bb-4021-bdca-203923c34dbe'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 8, '978bb70a-dbea-4285-9165-91efb141d619', '1c70dd1f-4373-4999-818e-bffcaaa7f30b'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 9, '978bb70a-dbea-4285-9165-91efb141d619', 'ddc41949-f3b7-40b0-88d3-d9f649836cd5'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 10, '978bb70a-dbea-4285-9165-91efb141d619', 'b11c03b2-826a-4fbe-a469-f9c5768cf2c8'),
          
          --- South Coast Panel
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 0, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'e6ddd1af-1cb9-4e45-962a-92e8d532b149'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 1, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'fac4b88a-9c1a-41f4-885c-408ba6c095ec'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 2, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'b9fc6416-95c3-40f9-9d32-5e7e3d1231b9'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 3, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'aa5bb0f3-8e50-479c-8c99-105a6d3e2565'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 4, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', '42384f47-d6d1-4b5e-ad9c-a66fc754dd52'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 5, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', '64944bb8-f2f2-4709-9062-214f5c4d3187'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 6, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', '5f233a50-97ec-44d3-af56-309f0cdeb29d'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 7, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'f784320d-57bb-4021-bdca-203923c34dbe'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 8, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', '1c70dd1f-4373-4999-818e-bffcaaa7f30b'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 9, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'ddc41949-f3b7-40b0-88d3-d9f649836cd5'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 10, 'b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'b11c03b2-826a-4fbe-a469-f9c5768cf2c8'),
          
          --- CEO
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 0, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'e6ddd1af-1cb9-4e45-962a-92e8d532b149'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 1, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'fac4b88a-9c1a-41f4-885c-408ba6c095ec'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 2, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'b9fc6416-95c3-40f9-9d32-5e7e3d1231b9'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 3, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'aa5bb0f3-8e50-479c-8c99-105a6d3e2565'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 4, 'b3b483b6-becd-43c2-92ed-b02e1864f039', '42384f47-d6d1-4b5e-ad9c-a66fc754dd52'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 5, 'b3b483b6-becd-43c2-92ed-b02e1864f039', '64944bb8-f2f2-4709-9062-214f5c4d3187'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 6, 'b3b483b6-becd-43c2-92ed-b02e1864f039', '5f233a50-97ec-44d3-af56-309f0cdeb29d'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 7, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'f784320d-57bb-4021-bdca-203923c34dbe'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 8, 'b3b483b6-becd-43c2-92ed-b02e1864f039', '1c70dd1f-4373-4999-818e-bffcaaa7f30b'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 9, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'ddc41949-f3b7-40b0-88d3-d9f649836cd5'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 10, 'b3b483b6-becd-43c2-92ed-b02e1864f039', 'b11c03b2-826a-4fbe-a469-f9c5768cf2c8'),
          
          --- Executive Committee
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 0, 'd8c18278-cb41-474e-a180-534a101243ab', 'e6ddd1af-1cb9-4e45-962a-92e8d532b149'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 1, 'd8c18278-cb41-474e-a180-534a101243ab', 'fac4b88a-9c1a-41f4-885c-408ba6c095ec'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 2, 'd8c18278-cb41-474e-a180-534a101243ab', 'b9fc6416-95c3-40f9-9d32-5e7e3d1231b9'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 3, 'd8c18278-cb41-474e-a180-534a101243ab', 'aa5bb0f3-8e50-479c-8c99-105a6d3e2565'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 4, 'd8c18278-cb41-474e-a180-534a101243ab', '42384f47-d6d1-4b5e-ad9c-a66fc754dd52'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 5, 'd8c18278-cb41-474e-a180-534a101243ab', '64944bb8-f2f2-4709-9062-214f5c4d3187'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 6, 'd8c18278-cb41-474e-a180-534a101243ab', '5f233a50-97ec-44d3-af56-309f0cdeb29d'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 7, 'd8c18278-cb41-474e-a180-534a101243ab', 'f784320d-57bb-4021-bdca-203923c34dbe'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 8, 'd8c18278-cb41-474e-a180-534a101243ab', '1c70dd1f-4373-4999-818e-bffcaaa7f30b'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 9, 'd8c18278-cb41-474e-a180-534a101243ab', 'ddc41949-f3b7-40b0-88d3-d9f649836cd5'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 10, 'd8c18278-cb41-474e-a180-534a101243ab', 'b11c03b2-826a-4fbe-a469-f9c5768cf2c8'),
          
          --- Executive Committee
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 0, 'd8c18278-cb41-474e-a180-534a101243ab', 'e6ddd1af-1cb9-4e45-962a-92e8d532b149'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 1, 'd8c18278-cb41-474e-a180-534a101243ab', 'fac4b88a-9c1a-41f4-885c-408ba6c095ec'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 2, 'd8c18278-cb41-474e-a180-534a101243ab', 'b9fc6416-95c3-40f9-9d32-5e7e3d1231b9'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 3, 'd8c18278-cb41-474e-a180-534a101243ab', 'aa5bb0f3-8e50-479c-8c99-105a6d3e2565'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 4, 'd8c18278-cb41-474e-a180-534a101243ab', '42384f47-d6d1-4b5e-ad9c-a66fc754dd52'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 5, 'd8c18278-cb41-474e-a180-534a101243ab', '64944bb8-f2f2-4709-9062-214f5c4d3187'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 6, 'd8c18278-cb41-474e-a180-534a101243ab', '5f233a50-97ec-44d3-af56-309f0cdeb29d'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 7, 'd8c18278-cb41-474e-a180-534a101243ab', 'f784320d-57bb-4021-bdca-203923c34dbe'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 8, 'd8c18278-cb41-474e-a180-534a101243ab', '1c70dd1f-4373-4999-818e-bffcaaa7f30b'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 9, 'd8c18278-cb41-474e-a180-534a101243ab', 'ddc41949-f3b7-40b0-88d3-d9f649836cd5'),
          (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 10, 'd8c18278-cb41-474e-a180-534a101243ab', 'b11c03b2-826a-4fbe-a469-f9c5768cf2c8');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "board_status"`);
    await queryRunner.query(`DELETE FROM "board"`);
  }
}
