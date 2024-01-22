import { MigrationInterface, QueryRunner } from 'typeorm';

export class naruDecisionComponentFields1687385079816
  implements MigrationInterface
{
  name = 'naruDecisionComponentFields1687385079816';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "naru_subtype_code" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD CONSTRAINT "FK_fbcbcc85133aa09fa8510d7bbb4" FOREIGN KEY ("naru_subtype_code") REFERENCES "alcs"."naru_subtype"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `
        INSERT INTO alcs.application_decision_component_type 
            (audit_deleted_date_at, audit_created_at, audit_updated_at, audit_created_by, audit_updated_by, "label", code, description) 
        values 
            (null , now(), now(), 'seed-migration','seed-migration' , 'Non-Adhering Residential Use', 'NARU', 'Non-Adhering Residential Use');
     `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP CONSTRAINT "FK_fbcbcc85133aa09fa8510d7bbb4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "naru_subtype_code"`,
    );
  }
}
