import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateModifications1697756665531 implements MigrationInterface {
  name = 'updateModifications1697756665531';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" DROP COLUMN "outcome_notification_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" ADD "description" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_modification"."description" IS 'Modification description provided by ALCS staff'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" ADD "description" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_modification"."description" IS 'Modification description provided by ALCS staff'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" DROP COLUMN "review_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" DROP COLUMN "review_date"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" ADD "review_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" ADD "review_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modification" ADD "outcome_notification_date" TIMESTAMP WITH TIME ZONE`,
    );
  }
}
