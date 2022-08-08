import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedApplicationRegion1659979182645 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "public"."application_region"
        ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        ('21cd6bbb-d352-4a37-8e79-0382e67455bf', NULL, '2022-08-08 17:21:32.20377+00', '2022-08-08 17:21:32.20377+00', 'alcs-api', NULL, 'Okanagan', 'OKAR', 'Okanagan Region'),
        ('41ab6a5e-050b-4ff6-a95d-d3161d960347', NULL, '2022-08-08 17:22:58.362584+00', '2022-08-08 17:22:58.362584+00', 'alcs-api', NULL, 'South Coast', 'SOUR', 'South Coast Region'),
        ('46e0b281-8acf-46c2-a4c5-b6a9932efefd', NULL, '2022-08-08 17:21:32.20377+00', '2022-08-08 17:21:32.20377+00', 'alcs-api', NULL, 'Kootenay', 'KOOR', 'Kootenay Region'),
        ('4723d359-7cad-4b25-9961-960cbf09ff7b', NULL, '2022-08-08 17:21:32.20377+00', '2022-08-08 17:21:32.20377+00', 'alcs-api', NULL, 'Interior', 'INTR', 'Interior Region'),
        ('9504c139-3403-48fa-b92b-5eb90c05f2d1', NULL, '2022-08-08 17:21:32.20377+00', '2022-08-08 17:21:32.20377+00', 'alcs-api', NULL, 'Island', 'ISLR', 'Island Region'),
        ('96b5e6b0-7e07-45db-a01d-8e5da60a39b9', NULL, '2022-08-08 17:21:32.20377+00', '2022-08-08 17:21:32.20377+00', 'alcs-api', NULL, 'North', 'NORR', 'North Region');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from public.application_decision_maker`);
  }
}
