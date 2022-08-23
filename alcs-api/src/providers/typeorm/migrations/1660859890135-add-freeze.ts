import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFreeze1660859890135 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //SQL Time Freezer from https://gist.github.com/thehesiod/d0314d599c721216f075375c667e2d9a
    await queryRunner.query(`
    CREATE SCHEMA if not exists override;
    
    create table if not exists override.freeze_time_param_type
    (
        param_type text not null primary key
    );
    insert into override.freeze_time_param_type values ('enabled'), ('timestamp'), ('tick') on conflict do nothing;
    
    create table if not exists override.freeze_time_params (
        param text not null primary key references override.freeze_time_param_type(param_type),
        value jsonb
    );
    
    insert into override.freeze_time_params values
        ('enabled', 'false'),
        ('timestamp', 'null'),
        ('tick', 'false')
    on conflict(param) do nothing;  -- don't overwrite existing state
    
    CREATE OR REPLACE FUNCTION override.freeze_time(freeze_time timestamp with time zone, tick bool default false)
        RETURNS void AS
    $$
    BEGIN
        insert into override.freeze_time_params(param, value) values
            ('enabled', 'true'),
            ('timestamp',  EXTRACT(EPOCH FROM freeze_time)::text::jsonb),
            ('tick', tick::text::jsonb)
        on conflict(param) do update set
            value = excluded.value;
    END
    $$ language plpgsql;
    
    create OR REPLACE function override.unfreeze_time()
        RETURNS void AS
    $$
    BEGIN
        insert into override.freeze_time_params(param, value) values
            ('enabled', 'false')
        on conflict(param) do update set
            value = excluded.value;
    END
    $$ language plpgsql;
    
    CREATE OR REPLACE FUNCTION override.now()
        RETURNS timestamptz AS
    $$
    DECLARE enabled text;
    DECLARE tick text;
    DECLARE timestamp timestamp;
    BEGIN
        select into enabled value from override.freeze_time_params where param = 'enabled';
        select into tick value from override.freeze_time_params where param = 'tick';
    
        if enabled then
            select into timestamp to_timestamp(value::text::decimal) from override.freeze_time_params where param = 'timestamp';
    
            if tick then
                timestamp = timestamp + '1 second'::interval;
                update override.freeze_time_params set value = extract(epoch from timestamp)::text::jsonb where param = 'timestamp';
            end if;
    
            return timestamp;
        else
            return pg_catalog.now();
    
        end if;
    END
    $$ language plpgsql;
    `);
  }

  public async down(queryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION override.now`);
    await queryRunner.query(`DROP SCHEMA override CASCADE`);
  }
}
