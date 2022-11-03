import { MigrationInterface, QueryRunner } from 'typeorm';

export class subtaskTypeUpdate1667500506754 implements MigrationInterface {
  name = 'subtaskTypeUpdate1667500506754';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card_subtask" ADD "type_code" text;
       UPDATE "card_subtask" SET type_code = 'GIS' WHERE type_uuid='f5bef372-0adf-4ac6-adea-a9316529b534';
       UPDATE "card_subtask" SET type_code = 'AUDIT' WHERE type_uuid='42c0331a-8a03-4fee-ac61-bf85339ad16f';
       ALTER TABLE "card_subtask" DROP CONSTRAINT "FK_b2ea292f93c675defa3b3cc93dd";
       ALTER TABLE "card_subtask" DROP COLUMN "type_uuid";
      `,
    );

    await queryRunner.query(
      `ALTER TABLE "card_subtask_type" DROP CONSTRAINT "PK_b2ea292f93c675defa3b3cc93dd";
       ALTER TABLE "card_subtask_type" RENAME COLUMN type to code;
       ALTER TABLE "card_subtask_type" ADD "label" text NULL;
       ALTER TABLE "card_subtask_type" ADD "description" text NULL;
       ALTER TABLE "card_subtask_type" ADD CONSTRAINT "PK_ea97b0efe5b7c84d8146e8c9184" PRIMARY KEY ("code");
       ALTER TABLE "card_subtask_type" ADD CONSTRAINT "UQ_b0fe71e81495b000b2fd3637ef5" UNIQUE ("description");

       UPDATE "card_subtask_type" SET label = code, description = code;

       ALTER TABLE "card_subtask_type" ALTER COLUMN "label" SET NOT NULL;
       ALTER TABLE "card_subtask_type" ALTER COLUMN "description" SET NOT NULL;
      `,
    );

    await queryRunner.query(
      `ALTER TABLE "card_subtask" ADD CONSTRAINT "FK_ea97b0efe5b7c84d8146e8c9184" FOREIGN KEY ("type_code") REFERENCES "card_subtask_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;`,
    );

    await queryRunner.query(
      `UPDATE "card_subtask_type" SET code = 'AUDIT' where code = 'Audit';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
