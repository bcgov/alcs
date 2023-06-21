import { MigrationInterface, QueryRunner } from 'typeorm';

export class localGovermentUuidIndexes1687287474493
  implements MigrationInterface
{
  name = 'localGovermentUuidIndexes1687287474493';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_39c4f5ceb0f5a7a4c819d46a0d" ON "alcs"."application" ("file_number") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_58853fcb8957e8b2c131cc12da" ON "alcs"."application" ("local_government_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a5dfb1e8f2d584102ea62cc2ee" ON "alcs"."covenant" ("file_number") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0fa742d800bc0e0b3f2451e0f0" ON "alcs"."covenant" ("local_government_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_66754bb64e9b1625c98b9cc0f6" ON "alcs"."notice_of_intent" ("file_number") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7e78db4d1c5afb16374253b42d" ON "alcs"."notice_of_intent" ("local_government_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a62913da5fae4a128c8e8f264f" ON "alcs"."planning_review" ("file_number") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5a57c8d407eb6132ed39cb8fe6" ON "alcs"."planning_review" ("local_government_uuid") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_5a57c8d407eb6132ed39cb8fe6"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_a62913da5fae4a128c8e8f264f"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_7e78db4d1c5afb16374253b42d"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_66754bb64e9b1625c98b9cc0f6"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_0fa742d800bc0e0b3f2451e0f0"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_a5dfb1e8f2d584102ea62cc2ee"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_58853fcb8957e8b2c131cc12da"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_39c4f5ceb0f5a7a4c819d46a0d"`,
    );
  }
}
