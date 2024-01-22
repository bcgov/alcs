import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameNotificationCardType1694457087578
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "alcs"."card_type" SET "code" = 'NOTI', "description" = 'Card type for notifications (currently SRW)' WHERE "code" = 'SRW';
    `);
  }

  public async down(): Promise<void> {
    //Nope
  }
}
