import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTriggerHelperFunctions1658442355602
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.audit_updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    console.log(
      'nothing to revert in createTriggerHelperFunctions1658442355602',
    );
  }
}
