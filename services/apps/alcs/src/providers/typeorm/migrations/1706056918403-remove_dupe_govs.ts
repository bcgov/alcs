import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDupeGovs1706056918403 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //City of Port Alberni
    await queryRunner.query(`
      UPDATE "alcs"."application" SET "local_government_uuid" = '1b9887fd-617d-4aef-891c-41dd2ad50d4b' WHERE "local_government_uuid" = 'b8a622d7-66da-4598-9687-2e8727fb2561';
      UPDATE "alcs"."notice_of_intent" SET "local_government_uuid" = '1b9887fd-617d-4aef-891c-41dd2ad50d4b' WHERE "local_government_uuid" = 'b8a622d7-66da-4598-9687-2e8727fb2561';
      UPDATE "alcs"."planning_review" SET "local_government_uuid" = '1b9887fd-617d-4aef-891c-41dd2ad50d4b' WHERE "local_government_uuid" = 'b8a622d7-66da-4598-9687-2e8727fb2561';
      UPDATE "alcs"."covenant" SET "local_government_uuid" = '1b9887fd-617d-4aef-891c-41dd2ad50d4b' WHERE "local_government_uuid" = 'b8a622d7-66da-4598-9687-2e8727fb2561';

      DELETE FROM "alcs"."local_government" WHERE "uuid" = 'b8a622d7-66da-4598-9687-2e8727fb2561';
    `);

    //District of Barriere
    await queryRunner.query(`
      UPDATE "alcs"."application" SET "local_government_uuid" = 'a7e16ffa-a218-4f8c-9695-9642a9987e3b' WHERE "local_government_uuid" = 'd3f74ba5-0dc3-43ea-a7e2-004882d65c33';
      UPDATE "alcs"."notice_of_intent" SET "local_government_uuid" = 'a7e16ffa-a218-4f8c-9695-9642a9987e3b' WHERE "local_government_uuid" = 'd3f74ba5-0dc3-43ea-a7e2-004882d65c33';
      UPDATE "alcs"."planning_review" SET "local_government_uuid" = 'a7e16ffa-a218-4f8c-9695-9642a9987e3b' WHERE "local_government_uuid" = 'd3f74ba5-0dc3-43ea-a7e2-004882d65c33';
      UPDATE "alcs"."covenant" SET "local_government_uuid" = 'a7e16ffa-a218-4f8c-9695-9642a9987e3b' WHERE "local_government_uuid" = 'd3f74ba5-0dc3-43ea-a7e2-004882d65c33';

      DELETE FROM "alcs"."local_government" WHERE "uuid" = 'd3f74ba5-0dc3-43ea-a7e2-004882d65c33';
    `);

    //District of Fort St. James
    await queryRunner.query(`
      UPDATE "alcs"."application" SET "local_government_uuid" = 'b89df1ef-9b1d-494e-8387-b1ba6abaf637' WHERE "local_government_uuid" = 'e0684ddf-fa61-47c2-87b3-1c72bed5c365';
      UPDATE "alcs"."notice_of_intent" SET "local_government_uuid" = 'b89df1ef-9b1d-494e-8387-b1ba6abaf637' WHERE "local_government_uuid" = 'e0684ddf-fa61-47c2-87b3-1c72bed5c365';
      UPDATE "alcs"."planning_review" SET "local_government_uuid" = 'b89df1ef-9b1d-494e-8387-b1ba6abaf637' WHERE "local_government_uuid" = 'e0684ddf-fa61-47c2-87b3-1c72bed5c365';
      UPDATE "alcs"."covenant" SET "local_government_uuid" = 'b89df1ef-9b1d-494e-8387-b1ba6abaf637' WHERE "local_government_uuid" = 'e0684ddf-fa61-47c2-87b3-1c72bed5c365';

      DELETE FROM "alcs"."local_government" WHERE "uuid" = 'e0684ddf-fa61-47c2-87b3-1c72bed5c365';
    `);

    //District of Hudson’s Hope
    await queryRunner.query(`
      UPDATE "alcs"."application" SET "local_government_uuid" = 'df19457c-4511-4104-bc85-9675412a6359' WHERE "local_government_uuid" = '79c3e16e-fdb9-4bb0-a427-f044a5d4bb95';
      UPDATE "alcs"."notice_of_intent" SET "local_government_uuid" = 'df19457c-4511-4104-bc85-9675412a6359' WHERE "local_government_uuid" = '79c3e16e-fdb9-4bb0-a427-f044a5d4bb95';
      UPDATE "alcs"."planning_review" SET "local_government_uuid" = 'df19457c-4511-4104-bc85-9675412a6359' WHERE "local_government_uuid" = '79c3e16e-fdb9-4bb0-a427-f044a5d4bb95';
      UPDATE "alcs"."covenant" SET "local_government_uuid" = 'df19457c-4511-4104-bc85-9675412a6359' WHERE "local_government_uuid" = '79c3e16e-fdb9-4bb0-a427-f044a5d4bb95';

      DELETE FROM "alcs"."local_government" WHERE "uuid" = '79c3e16e-fdb9-4bb0-a427-f044a5d4bb95';
    `);

    //Northern Rockies (Historical)
    await queryRunner.query(`
      UPDATE "alcs"."application" SET "local_government_uuid" = '55f665bc-c91b-4bbb-85c2-39691088b297' WHERE "local_government_uuid" = '02afc23a-088c-4c09-aa69-b5c6c516cabc';
      UPDATE "alcs"."notice_of_intent" SET "local_government_uuid" = '55f665bc-c91b-4bbb-85c2-39691088b297' WHERE "local_government_uuid" = '02afc23a-088c-4c09-aa69-b5c6c516cabc';
      UPDATE "alcs"."planning_review" SET "local_government_uuid" = '55f665bc-c91b-4bbb-85c2-39691088b297' WHERE "local_government_uuid" = '02afc23a-088c-4c09-aa69-b5c6c516cabc';
      UPDATE "alcs"."covenant" SET "local_government_uuid" = '55f665bc-c91b-4bbb-85c2-39691088b297' WHERE "local_government_uuid" = '02afc23a-088c-4c09-aa69-b5c6c516cabc';

      DELETE FROM "alcs"."local_government" WHERE "uuid" = '02afc23a-088c-4c09-aa69-b5c6c516cabc';
    `);

    //Village of Canal Flats
    await queryRunner.query(`
      UPDATE "alcs"."application" SET "local_government_uuid" = '2627cced-4317-4291-aa17-499e273632cb' WHERE "local_government_uuid" = '6c0079df-2647-445f-9718-4433e9761eac';
      UPDATE "alcs"."notice_of_intent" SET "local_government_uuid" = '2627cced-4317-4291-aa17-499e273632cb' WHERE "local_government_uuid" = '6c0079df-2647-445f-9718-4433e9761eac';
      UPDATE "alcs"."planning_review" SET "local_government_uuid" = '2627cced-4317-4291-aa17-499e273632cb' WHERE "local_government_uuid" = '6c0079df-2647-445f-9718-4433e9761eac';
      UPDATE "alcs"."covenant" SET "local_government_uuid" = '2627cced-4317-4291-aa17-499e273632cb' WHERE "local_government_uuid" = '6c0079df-2647-445f-9718-4433e9761eac';

      DELETE FROM "alcs"."local_government" WHERE "uuid" = '6c0079df-2647-445f-9718-4433e9761eac';
    `);

    //Village of Port Clements
    await queryRunner.query(`
      UPDATE "alcs"."application" SET "local_government_uuid" = '81ace6dd-e590-4a45-80f1-50c592a4985e' WHERE "local_government_uuid" = '18bd941a-7c0f-44fe-9d12-a084d2a5f372';
      UPDATE "alcs"."notice_of_intent" SET "local_government_uuid" = '81ace6dd-e590-4a45-80f1-50c592a4985e' WHERE "local_government_uuid" = '18bd941a-7c0f-44fe-9d12-a084d2a5f372';
      UPDATE "alcs"."planning_review" SET "local_government_uuid" = '81ace6dd-e590-4a45-80f1-50c592a4985e' WHERE "local_government_uuid" = '18bd941a-7c0f-44fe-9d12-a084d2a5f372';
      UPDATE "alcs"."covenant" SET "local_government_uuid" = '81ace6dd-e590-4a45-80f1-50c592a4985e' WHERE "local_government_uuid" = '18bd941a-7c0f-44fe-9d12-a084d2a5f372';

      DELETE FROM "alcs"."local_government" WHERE "uuid" = '18bd941a-7c0f-44fe-9d12-a084d2a5f372';
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
