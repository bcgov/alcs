import { MigrationInterface, QueryRunner } from 'typeorm';

export class setDecisionAsNonNullableOnComponent1683921658082
  implements MigrationInterface
{
  name = 'setDecisionAsNonNullableOnComponent1683921658082';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP CONSTRAINT "FK_3b336a2df3a3ab65bbbd91008e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP CONSTRAINT "FK_0eff4e8760453f611498a394595"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ALTER COLUMN "application_decision_component_type_code" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ALTER COLUMN "application_decision_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD CONSTRAINT "FK_3b336a2df3a3ab65bbbd91008e7" FOREIGN KEY ("application_decision_component_type_code") REFERENCES "alcs"."application_decision_component_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD CONSTRAINT "FK_0eff4e8760453f611498a394595" FOREIGN KEY ("application_decision_uuid") REFERENCES "alcs"."application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP CONSTRAINT "FK_0eff4e8760453f611498a394595"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP CONSTRAINT "FK_3b336a2df3a3ab65bbbd91008e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ALTER COLUMN "application_decision_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ALTER COLUMN "application_decision_component_type_code" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD CONSTRAINT "FK_0eff4e8760453f611498a394595" FOREIGN KEY ("application_decision_uuid") REFERENCES "alcs"."application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD CONSTRAINT "FK_3b336a2df3a3ab65bbbd91008e7" FOREIGN KEY ("application_decision_component_type_code") REFERENCES "alcs"."application_decision_component_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
