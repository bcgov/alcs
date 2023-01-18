import { MigrationInterface, QueryRunner } from 'typeorm';

export class addReturnComment1674077327924 implements MigrationInterface {
  name = 'addReturnComment1674077327924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "returned_comment" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."returned_comment" IS 'Used to store comments when an Application is returned to the Applicant'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."returned_comment" IS 'Used to store comments when an Application is returned to the Applicant'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "returned_comment"`,
    );
  }
}
