BEGIN;
-- prepare pgtap
SELECT * from plan(6);

-- temp clear existing data
DELETE FROM alcs.holiday_entity;

-- prepare data
-- create holidays
prepare insert_2022_holidays AS
INSERT INTO alcs."holiday_entity" ("uuid", "name", "day") VALUES
    ('75579109-7394-4561-8e3a-8acd8472f45e', 'Holiday 1', '2022-08-30'),
    ('3fe6132e-ef24-4132-bacf-2a22bdf1a3d1', 'Holiday 2', '2022-07-25'),
    ('d93e9d9c-c1f6-4f1d-bcce-781d4d5ecd99', 'Holiday 3', '2022-08-01');
SELECT lives_ok('insert_2022_holidays', 'should insert holiday_entity');

-- test cases
SELECT is(alcs.get_holiday_count('2022-08-02', '2022-08-15'), 0, 'Should be 0 when no holidays');
SELECT is(alcs.get_holiday_count('2022-08-01', '2022-08-15'), 1, 'Should be 1 when starting on a holiday');
SELECT is(alcs.get_holiday_count('2022-07-26', '2022-08-01'), 1, 'Should be 1 when ending on a holiday');
SELECT is(alcs.get_holiday_count('2022-07-25', '2022-08-01'), 2, 'Should be 2 when starting and ending on a holiday');
SELECT is(alcs.get_holiday_count('2022-07-25', '2022-08-30'), 3, 'Should be 3 when starting and ending on a holiday with one in the middle');

-- properly finish test
SELECT * FROM finish();

-- roallback allchanges
ROLLBACK;