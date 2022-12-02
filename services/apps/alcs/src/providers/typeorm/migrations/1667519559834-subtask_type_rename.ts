import { MigrationInterface, QueryRunner } from 'typeorm';

export class subtaskTypeRename1667519559834 implements MigrationInterface {
  name = 'subtaskTypeRename1667519559834';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card_subtask_type" DROP COLUMN "uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_subtask" DROP CONSTRAINT "FK_ea97b0efe5b7c84d8146e8c9184";`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_subtask_type" ALTER COLUMN "label" TYPE varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_subtask_type" ALTER COLUMN "code" TYPE text`,
    );
    await queryRunner.query(
      `UPDATE "card_subtask_type" SET "code"='AUDT' WHERE "code" = 'AUDIT'`,
    );
    await queryRunner.query(
      `UPDATE "card_subtask" SET "type_code"='AUDT' WHERE "type_code" = 'AUDIT'`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_subtask" ADD CONSTRAINT "FK_ea97b0efe5b7c84d8146e8c9184" FOREIGN KEY ("type_code") REFERENCES "card_subtask_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // not needed
  }
}
