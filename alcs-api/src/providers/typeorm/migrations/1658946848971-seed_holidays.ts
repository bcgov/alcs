import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedApplicationStatus1658160165559 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "public"."holiday_entity" ("uuid", "name", "day") VALUES
      ('481649cb-9b7b-4df2-ab87-0e66a08095bb', 'New Year''s Day', '2022-01-01'),
      ('42b1d17f-8170-4e2d-9902-544f829fb92c', 'Family Day', '2022-02-21'),
      ('852f7de8-7b0e-4d49-9e1d-11061a7e4a57', 'Good Friday', '2022-04-15'),
      ('0108485e-0c0f-40c8-b193-d85aeca40278', 'Victoria Day', '2022-05-23'),
      ('f1e7110d-2575-4738-bed0-fbbc0dcfe66c', 'Canada Day', '2022-07-01'),
      ('c8886d10-6698-456e-9e4b-4289a154ddf0', 'BC Day', '2022-08-01'),
      ('d6903a10-6673-4cb7-bb05-e4bd65d67dbc', 'Labour Day', '2022-09-05'),
      ('1d746d0d-272d-48ba-8ce6-fa5f1063988a', 'Thanksgiving Day', '2022-10-10'),
      ('6934c527-f3c2-4a1b-ab54-7730cdc6a2a9', 'Remembrance Day', '2022-11-11'),
      ('3481464d-11d2-4809-8b6f-d18bcb56f444', 'Christmas Day', '2022-12-25'),
      ('7ad89e32-2075-4482-aa2a-7cb9b1b25c18', 'New Year''s Day', '2023-01-01'),
      ('d220bfdf-e2a7-47ea-aa2c-7791b1466c84', 'Family Day', '2023-02-20'),
      ('f6c47fe8-9304-4371-9f40-5c4fa7d17646', 'Good Friday', '2023-04-07'),
      ('2147887d-5f42-4eb7-b6fe-edfc49e61417', 'Victoria Day', '2023-05-22'),
      ('888d6ec0-f44f-4357-80b4-f80f8f1a7551', 'Canada Day', '2023-07-01'),
      ('39f574a7-bb9f-4ff5-9f00-6cd7d7ff9c69', 'BC Day', '2023-08-07'),
      ('89954259-5439-4909-b03c-3814ae4d5984', 'Labour Day', '2023-09-04'),
      ('ce16c960-73f2-440b-81b2-e19b5b8193ec', 'Thanksgiving Day', '2023-10-09'),
      ('3586224a-abaf-4c3d-ab22-868523f6c6f3', 'Remembrance Day', '2023-11-11'),
      ('6f85de70-e04b-4e7b-9a57-a7611f3ffb53', 'Christmas Day', '2023-12-25');`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from public.application_status`);
  }
}
