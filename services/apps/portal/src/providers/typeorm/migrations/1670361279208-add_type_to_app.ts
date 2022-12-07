import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTypeToApp1670361279208 implements MigrationInterface {
  name = 'addTypeToApp1670361279208';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE "portal"."application" CASCADE`);
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "type_code" character varying NOT NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."type_code" IS 'Application Type Code from ALCS System'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."type_code" IS 'Application Type Code from ALCS System'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "type_code"`,
    );
  }
}
