import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDupeGovs1706056918403 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //City of Port Alberni
    await queryRunner.query(`
      DELETE FROM "alcs"."local_government" WHERE "uuid" = 'b8a622d7-66da-4598-9687-2e8727fb2561'; 
    `);

    //District of Barriere
    await queryRunner.query(`
      DELETE FROM "alcs"."local_government" WHERE "uuid" = 'd3f74ba5-0dc3-43ea-a7e2-004882d65c33';
    `);

    //District of Fort St. James
    await queryRunner.query(`
      DELETE FROM "alcs"."local_government" WHERE "uuid" = 'e0684ddf-fa61-47c2-87b3-1c72bed5c365';
    `);

    //District of Hudson’s Hope
    await queryRunner.query(`
      DELETE FROM "alcs"."local_government" WHERE "uuid" = '79c3e16e-fdb9-4bb0-a427-f044a5d4bb95';
    `);

    //Northern Rockies (Historical)
    await queryRunner.query(`
      DELETE FROM "alcs"."local_government" WHERE "uuid" = '02afc23a-088c-4c09-aa69-b5c6c516cabc';
    `);

    //Village of Canal Flats
    await queryRunner.query(`
      DELETE FROM "alcs"."local_government" WHERE "uuid" = '6c0079df-2647-445f-9718-4433e9761eac';
    `);

    //Village of Port Clements
    await queryRunner.query(`
      DELETE FROM "alcs"."local_government" WHERE "uuid" = '18bd941a-7c0f-44fe-9d12-a084d2a5f372';
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
