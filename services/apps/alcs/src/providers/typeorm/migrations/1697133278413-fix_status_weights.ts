import { MigrationInterface, QueryRunner } from "typeorm"

export class fixStatusWeights1697133278413 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `UPDATE "alcs"."notification_submission_status_type"
          SET "weight" = '2'
          WHERE "code" = 'ALCR'`,
        );
        await queryRunner.query(
          `UPDATE "alcs"."notification_submission_status_type"
          SET "weight" = '3'
          WHERE "code" = 'CANC'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
