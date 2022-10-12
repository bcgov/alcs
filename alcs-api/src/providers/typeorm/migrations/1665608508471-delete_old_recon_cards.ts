import { MigrationInterface, QueryRunner } from 'typeorm';

export class deleteOldReconCards1665608508471 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "card_history" where card_uuid in (select uuid from card where type_uuid='2d7a9c6d-06e5-48e7-9002-d609aa575aff');`,
    );
    await queryRunner.query(
      `DELETE FROM "card_subtask"  where card_uuid in (select uuid from card where type_uuid='2d7a9c6d-06e5-48e7-9002-d609aa575aff' );`,
    );
    await queryRunner.query(
      `DELETE FROM "comment_mention" where comment_uuid  in (select c.uuid from "comment" c 
        join card c2 on c.card_uuid = c2.uuid 
        where c2.type_uuid='2d7a9c6d-06e5-48e7-9002-d609aa575aff');`,
    );
    await queryRunner.query(
      `DELETE FROM "comment" where card_uuid in (select uuid from card where type_uuid='2d7a9c6d-06e5-48e7-9002-d609aa575aff');`,
    );
    await queryRunner.query(
      `DELETE FROM "card" where type_uuid='2d7a9c6d-06e5-48e7-9002-d609aa575aff';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
