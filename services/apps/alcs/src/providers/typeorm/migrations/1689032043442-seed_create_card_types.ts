import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedCreateCardTypes1689032043442 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."board_create_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('b3b483b6-becd-43c2-92ed-b02e1864f039', 'RECON'), ---CEO
        ('b3b483b6-becd-43c2-92ed-b02e1864f039', 'MODI'),
        ('b3b483b6-becd-43c2-92ed-b02e1864f039', 'COV'),
        ('d8c18278-cb41-474e-a180-534a101243ab', 'RECON'), ---Executive Committee
        ('d8c18278-cb41-474e-a180-534a101243ab', 'PLAN'),
        ('d8c18278-cb41-474e-a180-534a101243ab', 'COV'),
        ('30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'RECON'), ---Film
        ('30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'COV'),
        ('46a8294f-27fd-477e-a722-50121d907bb1', 'RECON'), ---Interior
        ('46a8294f-27fd-477e-a722-50121d907bb1', 'COV'),
        ('325b6f2f-5612-47cb-b039-d934b180f417', 'RECON'), ---Island
        ('325b6f2f-5612-47cb-b039-d934b180f417', 'COV'),
        ('93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'RECON'), ---Kootenay
        ('93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'COV'),
        ('7eb6947b-0ef0-4e0b-aa21-5195817b6261', 'NOIM'), ---NOI
        ('978bb70a-dbea-4285-9165-91efb141d619', 'RECON'), ---North
        ('978bb70a-dbea-4285-9165-91efb141d619', 'COV'),
        ('88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'RECON'), ---Okanagan
        ('88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'COV'),
        ('76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'RECON'), ---Soil & Fill
        ('76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'COV'),
        ('b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'RECON'), ---South Coast
        ('b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'COV'),
        ('bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'APP'), ---Vetting
        ('bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'NOI');
      `);
  }

  public async down(): Promise<void> {
    //Not Needed
  }
}
