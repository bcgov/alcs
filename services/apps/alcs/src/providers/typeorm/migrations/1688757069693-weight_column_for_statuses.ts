import { MigrationInterface, QueryRunner } from 'typeorm';

export class weightColumnForStatuses1688757069693
  implements MigrationInterface
{
  name = 'weightColumnForStatuses1688757069693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."submission_status_type" ADD "weight" smallint NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."submission_status_type" DROP COLUMN "weight"`,
    );
  }
}
