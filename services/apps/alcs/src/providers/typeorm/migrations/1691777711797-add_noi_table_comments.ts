import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoiTableComments1691777711797 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        COMMENT ON TABLE "alcs"."notice_of_intent_parcel_ownership_type" IS 'Parcel Ownership types used for NOI Parcels';
        COMMENT ON TABLE "alcs"."notice_of_intent_parcel" IS 'Parcels that are linked to Notice of Intent Submissions';
        COMMENT ON TABLE "alcs"."notice_of_intent_owner" IS 'Owners for Notice of Intent Submissions';
        COMMENT ON TABLE "alcs"."notice_of_intent_parcel_owners_notice_of_intent_owner" IS 'Join table that links Owners to Parcels';
        COMMENT ON TABLE "alcs"."notice_of_intent_submission_status_type" IS 'The code table for Notice of Intent Submissions Statuses';
        COMMENT ON TABLE "alcs"."notice_of_intent_submission_to_submission_status" IS 'Join table to link Notice of Intent Submissions to their Statuses';
      `,
    );
  }

  public async down(): Promise<void> {
    //No
  }
}
