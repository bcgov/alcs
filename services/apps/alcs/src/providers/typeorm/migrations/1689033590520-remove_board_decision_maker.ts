import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeBoardDecisionMaker1689033590520
  implements MigrationInterface
{
  name = 'removeBoardDecisionMaker1689033590520';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."board" DROP COLUMN "decision_maker"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."board" ADD "decision_maker" character varying NOT NULL`,
    );
  }
}
