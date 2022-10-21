import { MigrationInterface, QueryRunner } from 'typeorm';

export class nullableReceivedDateOnApplication1666379516378
  implements MigrationInterface
{
  name = 'nullableReceivedDateOnApplication1666379516378';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "date_received" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "date_received" SET NOT NULL`,
    );
  }
}
