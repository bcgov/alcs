import { MigrationInterface, QueryRunner } from 'typeorm';

export class obsoleteNullableStatusCode1689187139689
  implements MigrationInterface
{
  name = 'obsoleteNullableStatusCode1689187139689';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE "alcs"."application_submission"  ALTER COLUMN status_code DROP NOT NULL;
       `,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "status_code"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
