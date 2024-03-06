with srw_type_lookup AS (
    SELECT oaac.alr_application_id AS application_id,
        oaac.alr_change_code AS code
    FROM oats.oats_alr_appl_components AS oaac
    WHERE oaac.alr_change_code = 'SRW'
),
application_rows as (
    select count(application_id)
    from srw_type_lookup stl
    group by stl.application_id
    having count(application_id) > 1
)
select count(*) as "count"
from application_rows