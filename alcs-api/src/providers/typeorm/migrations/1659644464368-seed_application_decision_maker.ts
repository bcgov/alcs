import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedApplicationDecisionMaker1659644464368
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "public"."application_decision_maker"
    ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "code", "description", "label") VALUES
    ('1e75ef98-ebd0-4414-a16d-ac9f3f56577d', NULL, '2022-08-04 20:30:05.420682+00', '2022-08-04 20:30:05.420682+00', 'alcs-api', NULL, 'EXEC', 'Executive Committee', 'Executive Committee'),
    ('2707577d-4e1b-4f8d-ba04-175295eef368', NULL, '2022-08-04 20:30:05.420682+00', '2022-08-04 20:30:05.420682+00', 'alcs-api', NULL, 'SOIL', 'Soil & Fill Panel', 'Soil & Fill Panel'),
    ('3ce5e660-9d55-43fb-956d-1c7e9e5c958c', NULL, '2022-08-04 20:30:05.420682+00', '2022-08-04 20:30:05.420682+00', 'alcs-api', NULL, 'CEOP', 'CEO', 'CEO'),
    ('4c3a6fe7-6fe1-4467-bb06-7c0f228a330f', NULL, '2022-08-04 20:28:41.109707+00', '2022-08-04 20:28:41.109707+00', 'alcs-api', NULL, 'KOOT', 'Kootenay Panel', 'Kootenay Panel'),
    ('55e9c12f-9867-4852-9c68-483cc24e6324', NULL, '2022-08-04 20:30:05.420682+00', '2022-08-04 20:30:05.420682+00', 'alcs-api', NULL, 'FILM', 'Film Panel', 'Film Panel'),
    ('76c1d7d2-0a3a-4649-98bd-6b66305eecb1', NULL, '2022-08-04 20:28:41.109707+00', '2022-08-04 20:28:41.109707+00', 'alcs-api', NULL, 'OKAN', 'Okanagan Panel', 'Okanagan Panel'),
    ('7713b381-af54-4e1d-bffb-515dec2210cc', NULL, '2022-08-04 20:27:32.698091+00', '2022-08-04 20:27:32.698091+00', 'alcs-api', NULL, 'INTE', 'Interior Panel', 'Interior Panel'),
    ('acfb734d-5194-4c05-8e9f-ff87a99c46e9', NULL, '2022-08-04 20:30:05.420682+00', '2022-08-04 20:30:05.420682+00', 'alcs-api', NULL, 'SOUT', 'South Coast Panel', 'South Coast Panel'),
    ('ae8cc147-ca3d-4bf4-8856-93097ed4acbb', NULL, '2022-08-04 20:28:41.109707+00', '2022-08-04 20:28:41.109707+00', 'alcs-api', NULL, 'ISLE', 'Island Panel', 'Island Panel'),
    ('fd6dce41-d1a7-4776-87d9-ddba75e33676', NULL, '2022-08-04 20:28:41.109707+00', '2022-08-04 20:28:41.109707+00', 'alcs-api', NULL, 'NORT', 'North Panel', 'North Panel');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from public.holiday_entity`);
  }
}
