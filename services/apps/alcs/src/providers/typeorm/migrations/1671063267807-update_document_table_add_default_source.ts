import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateDocumentTableAddDefaultSource1671063267807
  implements MigrationInterface
{
  name = 'updateDocumentTableAddDefaultSource1671063267807';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ALTER COLUMN "source" SET DEFAULT 'ALCS'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ALTER COLUMN "source" DROP DEFAULT`,
    );
  }
}
