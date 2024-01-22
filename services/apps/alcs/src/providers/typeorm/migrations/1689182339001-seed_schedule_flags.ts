import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedScheduleFlags1689182339001 implements MigrationInterface {
  name = 'seedScheduleFlags1689182339001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."board" ALTER COLUMN "show_on_schedule" DROP DEFAULT`,
    );

    //CEO
    await queryRunner.query(`
      UPDATE "alcs"."board" SET "show_on_schedule" = 'f' WHERE "code" = 'ceo';
    `);

    //VETTING
    await queryRunner.query(`
      UPDATE "alcs"."board" SET "show_on_schedule" = 'f' WHERE "code" = 'vett';
    `);

    //NOI
    await queryRunner.query(`
      UPDATE "alcs"."board" SET "show_on_schedule" = 'f' WHERE "code" = 'noi';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."board" ALTER COLUMN "show_on_schedule" SET DEFAULT true`,
    );
  }
}
