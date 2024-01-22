import { MigrationInterface, QueryRunner } from 'typeorm';

export class moreTableComments1691785736403 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
          COMMENT ON TABLE "alcs"."board_create_card_types_card_type" IS 'Contains the type of cards can be created from each board';
          COMMENT ON TABLE "alcs"."application_submission_to_submission_status" IS 'Join table that links submission with its status';
          COMMENT ON TABLE "alcs"."application_decision_condition_component" IS 'Join table that links decision condition with decision components';
        `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
