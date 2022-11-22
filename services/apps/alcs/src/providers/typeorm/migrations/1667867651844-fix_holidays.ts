import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixHolidays1667867651844 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      `DELETE FROM "holiday_entity" WHERE day BETWEEN '2023-01-01' AND '2023-12-31'`,
    );

    await queryRunner.query(`INSERT INTO "public"."holiday_entity" ("uuid", "name", "day") VALUES
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
      ('878406d8-3f0f-475d-a745-206b9144869c', 'Boxing Day', '2023-12-26');`);

    //Back Fill to 2016
    await queryRunner.query(`
    INSERT INTO "public"."holiday_entity" ("uuid", "name", "day") VALUES
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
      ('6b29c79d-a560-4379-99bc-117086e6d582', '', '2019-12-26');
    `);
  }

  public async down(): Promise<void> {
    //Not needed for data fixes
  }
}
