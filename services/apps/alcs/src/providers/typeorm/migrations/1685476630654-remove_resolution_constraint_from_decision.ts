import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeResolutionConstraintFromDecision1685476630654
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // this is not needed anymore since the logic is more complex and is handled by partial unique index
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT IF EXISTS "resolution"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
