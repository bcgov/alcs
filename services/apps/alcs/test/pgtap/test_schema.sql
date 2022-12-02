
BEGIN;
-- prepare pgtap
SELECT * from plan(12);

-- SET SCHEMA 'alcs';

SELECT has_schema('alcs');

SELECT has_table('alcs'::name, 'card_status'::name);
SELECT has_table('alcs'::name,'card'::name);
SELECT has_table('alcs'::name,'card_type'::name);
SELECT has_table('alcs'::name,'board'::name);
SELECT has_table('alcs'::name,'application_type'::name);
SELECT has_table('alcs'::name,'card_history'::name);
SELECT has_table('alcs'::name,'application_paused'::name);
SELECT has_table('alcs'::name,'application'::name);
SELECT has_table('alcs'::name,'user'::name);
SELECT has_table('alcs'::name,'holiday_entity'::name);
SELECT has_table('alcs'::name,'health_check'::name);

SELECT * FROM finish();

ROLLBACK;