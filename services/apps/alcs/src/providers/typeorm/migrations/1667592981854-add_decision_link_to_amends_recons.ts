import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDecisionLinkToAmendsRecons1667592981854
  implements MigrationInterface
{
  name = 'addDecisionLinkToAmendsRecons1667592981854';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE "application_reconsideration" CASCADE`);
    await queryRunner.query(`TRUNCATE "application_amendment" CASCADE`);

    await queryRunner.query(
      `CREATE TABLE "amended_decisions" ("application_amendment_uuid" uuid NOT NULL, "application_decision_uuid" uuid NOT NULL, CONSTRAINT "PK_7810fdcf4990efc106a8a782ca3" PRIMARY KEY ("application_amendment_uuid", "application_decision_uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_20ba0006777b542c6d02fd2717" ON "amended_decisions" ("application_amendment_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af9d814b83e6425505742b574a" ON "amended_decisions" ("application_decision_uuid") `,
    );
    await queryRunner.query(
      `CREATE TABLE "reconsidered_decisions" ("application_reconsideration_uuid" uuid NOT NULL, "application_decision_uuid" uuid NOT NULL, CONSTRAINT "PK_cb96dbef3e7dd5c3db49c62d517" PRIMARY KEY ("application_reconsideration_uuid", "application_decision_uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d7e09c1b2ce86005b7d0465215" ON "reconsidered_decisions" ("application_reconsideration_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_09a58410db3f33249018127977" ON "reconsidered_decisions" ("application_decision_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "amended_decisions" ADD CONSTRAINT "FK_20ba0006777b542c6d02fd27175" FOREIGN KEY ("application_amendment_uuid") REFERENCES "application_amendment"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "amended_decisions" ADD CONSTRAINT "FK_af9d814b83e6425505742b574a0" FOREIGN KEY ("application_decision_uuid") REFERENCES "application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reconsidered_decisions" ADD CONSTRAINT "FK_d7e09c1b2ce86005b7d0465215f" FOREIGN KEY ("application_reconsideration_uuid") REFERENCES "application_reconsideration"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "reconsidered_decisions" ADD CONSTRAINT "FK_09a58410db3f332490181279771" FOREIGN KEY ("application_decision_uuid") REFERENCES "application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reconsidered_decisions" DROP CONSTRAINT "FK_09a58410db3f332490181279771"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reconsidered_decisions" DROP CONSTRAINT "FK_d7e09c1b2ce86005b7d0465215f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "amended_decisions" DROP CONSTRAINT "FK_af9d814b83e6425505742b574a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "amended_decisions" DROP CONSTRAINT "FK_20ba0006777b542c6d02fd27175"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_09a58410db3f33249018127977"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d7e09c1b2ce86005b7d0465215"`,
    );
    await queryRunner.query(`DROP TABLE "reconsidered_decisions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_af9d814b83e6425505742b574a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_20ba0006777b542c6d02fd2717"`,
    );
    await queryRunner.query(`DROP TABLE "amended_decisions"`);
  }
}
