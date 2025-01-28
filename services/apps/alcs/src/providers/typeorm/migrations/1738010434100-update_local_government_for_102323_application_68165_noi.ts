import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateLocalGovernmentFor102323Application68165Noi1738010434100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update Application entity
    await queryRunner.query(`
        UPDATE "alcs"."application"
        SET "local_government_uuid" = (
          SELECT "uuid"
          FROM "alcs"."local_government"
          WHERE "bceid_business_guid" = '04996403089F4A3C8B4ADC3A73DFF0B7'
        )
        WHERE "file_number" = '102323'
        AND "local_government_uuid" = (
          SELECT "uuid"
          FROM "alcs"."local_government"
          WHERE "bceid_business_guid" = '95C27BA79CE148B78D23F19AB075F705'
        );
      `);

    // Update NoticeOfIntent entity
    await queryRunner.query(`
        UPDATE "alcs"."notice_of_intent"
        SET "local_government_uuid" = (
          SELECT "uuid"
          FROM "alcs"."local_government"
          WHERE "bceid_business_guid" = '04996403089F4A3C8B4ADC3A73DFF0B7'
        )
        WHERE "file_number" = '68165'
        AND "local_government_uuid" = (
          SELECT "uuid"
          FROM "alcs"."local_government"
          WHERE "bceid_business_guid" = '95C27BA79CE148B78D23F19AB075F705'
        );
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert Application entity
    await queryRunner.query(`
            UPDATE "alcs"."application"
            SET "local_government_uuid" = (
              SELECT "uuid"
              FROM "alcs"."local_government"
              WHERE "bceid_business_guid" = '95C27BA79CE148B78D23F19AB075F705'
            )
            WHERE "file_number" = '102323'
            AND "local_government_uuid" = (
              SELECT "uuid"
              FROM "alcs"."local_government"
              WHERE "bceid_business_guid" = '04996403089F4A3C8B4ADC3A73DFF0B7'
            );
          `);

    // Revert NoticeOfIntent entity
    await queryRunner.query(`
            UPDATE "alcs"."notice_of_intent"
            SET "local_government_uuid" = (
              SELECT "uuid"
              FROM "alcs"."local_government"
              WHERE "bceid_business_guid" = '95C27BA79CE148B78D23F19AB075F705'
            )
            WHERE "file_number" = '68165'
            AND "local_government_uuid" = (
              SELECT "uuid"
              FROM "alcs"."local_government"
              WHERE "bceid_business_guid" = '04996403089F4A3C8B4ADC3A73DFF0B7'
            );
          `);
  }
}
