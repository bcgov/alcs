import { MigrationInterface, QueryRunner } from 'typeorm';

export class ApplicationIndexes1702317710836 implements MigrationInterface {
  name = 'ApplicationIndexes1702317710836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_8629d5787d89267d417dcbb369" ON "alcs"."application_decision_meeting" ("application_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6c496454f95f229c63679bf191" ON "alcs"."application_document" ("application_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_57e39f7c811d07c646fc04e8bd" ON "alcs"."application_paused" ("application_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4a7e09569765e147304194b63f" ON "alcs"."application_meeting" ("application_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_21eddf92cb75ff3cc0c99b80d8" ON "alcs"."application" ("card_uuid") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_21eddf92cb75ff3cc0c99b80d8"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_4a7e09569765e147304194b63f"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_57e39f7c811d07c646fc04e8bd"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_6c496454f95f229c63679bf191"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_8629d5787d89267d417dcbb369"`,
    );
  }
}
