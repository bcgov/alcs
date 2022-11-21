import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateHolidays1665597484462 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //Add 2020
    await queryRunner.query(`INSERT INTO "public"."holiday_entity" ("uuid", "name", "day") VALUES
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
      ('f2a5c5b3-f700-495f-a979-06cb1fe88bf9', 'Boxing Day', '2020-12-28');`);

    //Add 2021
    await queryRunner.query(`INSERT INTO "public"."holiday_entity" ("uuid", "name", "day") VALUES
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
      ('56876a49-0e2a-4b29-8b5d-5c50f3b0ee9e', 'Boxing Day', '2021-12-28');`);

    //Add missing 2022
    await queryRunner.query(`INSERT INTO "public"."holiday_entity" ("uuid", "name", "day") VALUES
      ('78eb7c2d-f588-4360-b24a-40fba537c305', 'Easter Monday', '2022-04-18'),
      ('64b68abe-d499-418a-8cd6-4a5b9680a71a', 'Queens Funeral Day', '2022-09-19'),
      ('e2942d3c-ba45-4d33-9945-f1472c7c3587', 'National Truth and Reconciliation Day', '2022-09-30'),
      ('7f47eb7a-8dd8-4598-a43a-918a61a42f80', 'Boxing Day', '2022-12-27');`);

    //Fix incorrect 2022 days
    await queryRunner.query(
      `UPDATE "public"."holiday_entity" SET "day" = '2022-01-03' WHERE "uuid" = '481649cb-9b7b-4df2-ab87-0e66a08095bb';`,
    );
    await queryRunner.query(
      `UPDATE "public"."holiday_entity" SET "day" = '2022-12-26' WHERE "uuid" = '3481464d-11d2-4809-8b6f-d18bcb56f444';`,
    );
  }

  public async down(): Promise<void> {
    //No down, only fix
  }
}
