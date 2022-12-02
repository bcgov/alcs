import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateResoultionNumberType1669151408157
  implements MigrationInterface
{
  name = 'updateResoultionNumberType1669151408157';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_modification" DROP CONSTRAINT "FK_3e941d0e00fafdb9830799dc804"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_modification" DROP CONSTRAINT "FK_673f2b816b3ef5e11c8c1e0e980"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "FK_3142742a93fe3ad2a9126d0f025"`,
    );
    await queryRunner.query(
      `ALTER TABLE "modified_decisions" DROP CONSTRAINT "FK_20ba0006777b542c6d02fd27175"`,
    );
    await queryRunner.query(
      `ALTER TABLE "modified_decisions" DROP CONSTRAINT "FK_af9d814b83e6425505742b574a0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_20ba0006777b542c6d02fd2717"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_af9d814b83e6425505742b574a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "resolution"`,
    );
    await queryRunner.query(
      `
      ALTER TABLE "application_decision" ALTER COLUMN "resolution_number" TYPE int4;
      `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_733d6d17b98e6b6d3cd8335910" ON "modified_decisions" ("application_modification_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0e1b988c373de06ec277bca369" ON "modified_decisions" ("application_decision_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "resolution" UNIQUE ("resolution_number", "resolution_year")`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_modification" ADD CONSTRAINT "FK_3839ac16a55bdfe8fda77dbd050" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_modification" ADD CONSTRAINT "FK_cd2e34439334004189a8767b960" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "FK_336dee89b6eed32db8e13ea0fe9" FOREIGN KEY ("modifies_uuid") REFERENCES "application_modification"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "modified_decisions" ADD CONSTRAINT "FK_733d6d17b98e6b6d3cd83359101" FOREIGN KEY ("application_modification_uuid") REFERENCES "application_modification"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "modified_decisions" ADD CONSTRAINT "FK_0e1b988c373de06ec277bca3692" FOREIGN KEY ("application_decision_uuid") REFERENCES "application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "modified_decisions" DROP CONSTRAINT "FK_0e1b988c373de06ec277bca3692"`,
    );
    await queryRunner.query(
      `ALTER TABLE "modified_decisions" DROP CONSTRAINT "FK_733d6d17b98e6b6d3cd83359101"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "FK_336dee89b6eed32db8e13ea0fe9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_modification" DROP CONSTRAINT "FK_cd2e34439334004189a8767b960"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_modification" DROP CONSTRAINT "FK_3839ac16a55bdfe8fda77dbd050"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "resolution"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0e1b988c373de06ec277bca369"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_733d6d17b98e6b6d3cd8335910"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "resolution" UNIQUE ("resolution_number", "resolution_year")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af9d814b83e6425505742b574a" ON "modified_decisions" ("application_decision_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_20ba0006777b542c6d02fd2717" ON "modified_decisions" ("application_modification_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "modified_decisions" ADD CONSTRAINT "FK_af9d814b83e6425505742b574a0" FOREIGN KEY ("application_decision_uuid") REFERENCES "application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "modified_decisions" ADD CONSTRAINT "FK_20ba0006777b542c6d02fd27175" FOREIGN KEY ("application_modification_uuid") REFERENCES "application_modification"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "FK_3142742a93fe3ad2a9126d0f025" FOREIGN KEY ("modifies_uuid") REFERENCES "application_modification"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_modification" ADD CONSTRAINT "FK_673f2b816b3ef5e11c8c1e0e980" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_modification" ADD CONSTRAINT "FK_3e941d0e00fafdb9830799dc804" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
