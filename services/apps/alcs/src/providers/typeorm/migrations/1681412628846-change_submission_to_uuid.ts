import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeSubmissionToUuid1681412628846 implements MigrationInterface {
  name = 'changeSubmissionToUuid1681412628846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    //Remove FKs and Rename
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP CONSTRAINT "FK_803e574fe048adacb88443c8d45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP CONSTRAINT "FK_8104e51d0d9d1e920cd0f6df17c"`,
    );

    //Add new uuids
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "uuid" uuid NOT NULL DEFAULT gen_random_uuid()`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD "application_submission_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD "application_submission_uuid" uuid`,
    );

    //Replace File Number with UUID
    await queryRunner.query(
      `UPDATE
        "alcs"."application_parcel"
      SET
        "application_submission_uuid" = "application_submission"."uuid"
      FROM
        "alcs"."application_submission"
        WHERE "application_parcel"."application_file_number" = "application_submission"."file_number";`,
    );

    await queryRunner.query(
      `UPDATE
        "alcs"."application_owner"
      SET
        "application_submission_uuid" = "application_submission"."uuid"
      FROM
        "alcs"."application_submission"
        WHERE "application_owner"."application_file_number" = "application_submission"."file_number";`,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP COLUMN "application_file_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP COLUMN "application_file_number"`,
    );

    //Re-setup PK and FKs
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP CONSTRAINT "PK_4776c7dcd306a47a372b322fd9b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD CONSTRAINT "PK_61e192975e82347bab189b34fcc" PRIMARY KEY ("uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD CONSTRAINT "FK_df7ec267eba52ce3234ff1f2d33" FOREIGN KEY ("application_submission_uuid") REFERENCES "alcs"."application_submission"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD CONSTRAINT "FK_4e3d14c8a4b41430bfc7b2ed5e2" FOREIGN KEY ("application_submission_uuid") REFERENCES "alcs"."application_submission"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ALTER COLUMN "application_submission_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ALTER COLUMN "application_submission_uuid" SET NOT NULL`,
    );

    //Add Draft
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "is_draft" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission"."is_draft" IS 'Indicates whether submission is currently draft or not'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //Remove Draft
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "is_draft"`,
    );

    //Re-setup PK and FKs
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP CONSTRAINT "FK_4776c7dcd306a47a372b322fd9b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP CONSTRAINT "FK_4e3d14c8a4b41430bfc7b2ed5e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP CONSTRAINT "FK_4b5a4dca01e2f175fa448a734f9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP CONSTRAINT "FK_df7ec267eba52ce3234ff1f2d33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP CONSTRAINT "PK_61e192975e82347bab189b34fcc"`,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD CONSTRAINT "FK_4776c7dcd306a47a372b322fd9b" FOREIGN KEY ("file_number") REFERENCES "alcs"."application"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" RENAME COLUMN "application_submission_uuid" TO "application_file_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" RENAME COLUMN "application_submission_uuid" TO "application_file_number"`,
    );

    //Replace UUID with File Number
    await queryRunner.query(
      `UPDATE
        "alcs"."application_parcel"
      SET
        "application_file_number" = "application_submission"."file_number"
      FROM
        "alcs"."application_parcel"
        JOIN "alcs"."application_submission" ON ("application_parcel"."application_submission_uuid" = "application_submission"."uuid");`,
    );

    await queryRunner.query(
      `UPDATE
        "alcs"."application_owner"
      SET
        "application_file_number" = "application_submission"."file_number"
      FROM
        "alcs"."application_owner"
        JOIN "alcs"."application_submission" ON ("application_owner"."application_submission_uuid" = "application_submission"."uuid");`,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "uuid"`,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD CONSTRAINT "FK_8104e51d0d9d1e920cd0f6df17c" FOREIGN KEY ("application_file_number") REFERENCES "alcs"."application_submission"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD CONSTRAINT "FK_803e574fe048adacb88443c8d45" FOREIGN KEY ("application_file_number") REFERENCES "alcs"."application_submission"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
