import { MigrationInterface, QueryRunner } from 'typeorm';

export class newReconsiderationFields1687808298996
  implements MigrationInterface
{
  name = 'newReconsiderationFields1687808298996';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ADD "description" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_reconsideration"."description" IS 'Reconsideration description provided by ALCS staff'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ADD "is_new_proposal" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ADD "is_incorrect_false_info" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ADD "is_new_evidence" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" DROP COLUMN "is_new_evidence"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" DROP COLUMN "is_incorrect_false_info"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" DROP COLUMN "is_new_proposal"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_reconsideration"."description" IS 'Reconsideration description provided by ALCS staff'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" DROP COLUMN "description"`,
    );
  }
}
