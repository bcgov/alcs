import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedBoardAllowedCardTypes1685468614305
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    //Create NOIs Board
    await queryRunner.query(`
      INSERT INTO "alcs"."board" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "uuid", "code", "title", "decision_maker") VALUES
        (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, '7eb6947b-0ef0-4e0b-aa21-5195817b6261', 'noi', 'NOIs', 'CEO');
    `);

    //NOIs
    await queryRunner.query(`
      INSERT INTO "alcs"."board_allowed_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('7eb6947b-0ef0-4e0b-aa21-5195817b6261', 'NOI');
    `);

    //Film
    await queryRunner.query(`
      INSERT INTO "alcs"."board_allowed_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'APP'),
        ('30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'RECON'),
        ('30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'PLAN'),
        ('30a432ce-fd7b-40fd-9b6e-4d9df305b57f', 'COV');
    `);

    //Island
    await queryRunner.query(`
      INSERT INTO "alcs"."board_allowed_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('325b6f2f-5612-47cb-b039-d934b180f417', 'APP'),
        ('325b6f2f-5612-47cb-b039-d934b180f417', 'RECON'),
        ('325b6f2f-5612-47cb-b039-d934b180f417', 'PLAN'),
        ('325b6f2f-5612-47cb-b039-d934b180f417', 'COV');
    `);

    //Interior
    await queryRunner.query(`
      INSERT INTO "alcs"."board_allowed_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('46a8294f-27fd-477e-a722-50121d907bb1', 'APP'),
        ('46a8294f-27fd-477e-a722-50121d907bb1', 'RECON'),
        ('46a8294f-27fd-477e-a722-50121d907bb1', 'PLAN'),
        ('46a8294f-27fd-477e-a722-50121d907bb1', 'COV');
    `);

    //Soil and Fill
    await queryRunner.query(`
      INSERT INTO "alcs"."board_allowed_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'APP'),
        ('76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'RECON'),
        ('76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'PLAN'),
        ('76fb47cf-7695-4a6e-8c71-c25a255cbcae', 'COV');
    `);

    //Okanagan
    await queryRunner.query(`
      INSERT INTO "alcs"."board_allowed_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'APP'),
        ('88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'RECON'),
        ('88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'PLAN'),
        ('88fefa0b-98db-4cb4-af42-17f169f1c7ed', 'COV');
    `);

    //Kootenay
    await queryRunner.query(`
      INSERT INTO "alcs"."board_allowed_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'APP'),
        ('93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'RECON'),
        ('93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'PLAN'),
        ('93b54e2c-6c1f-4fae-8cff-2b49da223dd2', 'COV');
    `);

    //North
    await queryRunner.query(`
      INSERT INTO "alcs"."board_allowed_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('978bb70a-dbea-4285-9165-91efb141d619', 'APP'),
        ('978bb70a-dbea-4285-9165-91efb141d619', 'RECON'),
        ('978bb70a-dbea-4285-9165-91efb141d619', 'PLAN'),
        ('978bb70a-dbea-4285-9165-91efb141d619', 'COV');
    `);

    //South
    await queryRunner.query(`
      INSERT INTO "alcs"."board_allowed_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'APP'),
        ('b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'RECON'),
        ('b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'PLAN'),
        ('b31621ec-2d65-4d9a-be76-d05a49bd5ebf', 'COV');
    `);

    //CEO
    await queryRunner.query(`
      INSERT INTO "alcs"."board_allowed_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('b3b483b6-becd-43c2-92ed-b02e1864f039', 'APP'),
        ('b3b483b6-becd-43c2-92ed-b02e1864f039', 'RECON'),
        ('b3b483b6-becd-43c2-92ed-b02e1864f039', 'MODI'),
        ('b3b483b6-becd-43c2-92ed-b02e1864f039', 'PLAN'),
        ('b3b483b6-becd-43c2-92ed-b02e1864f039', 'COV');
    `);

    //Vetting
    await queryRunner.query(`
      INSERT INTO "alcs"."board_allowed_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'APP'),
        ('bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'RECON'),
        ('bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'MODI'),
        ('bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'PLAN'),
        ('bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'NOI'),
        ('bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'COV');
    `);

    //Exec
    await queryRunner.query(`
      INSERT INTO "alcs"."board_allowed_card_types_card_type" ("board_uuid", "card_type_code") VALUES
        ('d8c18278-cb41-474e-a180-534a101243ab', 'APP'),
        ('d8c18278-cb41-474e-a180-534a101243ab', 'RECON'),
        ('d8c18278-cb41-474e-a180-534a101243ab', 'PLAN'),
        ('d8c18278-cb41-474e-a180-534a101243ab', 'COV');
    `);
  }

  public async down(): Promise<void> {
    //No!
  }
}
