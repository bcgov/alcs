import { MigrationInterface, QueryRunner } from 'typeorm';

export class tableComments1691094096225 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        COMMENT ON TABLE "alcs"."application_decision_condition_component_plan_number" IS 'Survey plan numbers associated with survey plan conditions on decision components';
        COMMENT ON TABLE "alcs"."application_decision_condition_component" IS 'Join table to link decision conditions with decision components';
        COMMENT ON TABLE "alcs"."application_decision_condition_to_component_lot" IS 'Join table to link approved subdivision lots between condition and components and provide plan numbers associated with survey plan per lot';
        COMMENT ON TABLE "alcs"."application_decision_component_lot" IS 'Approved lots on the subdivision decision component';
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // not needed
  }
}
