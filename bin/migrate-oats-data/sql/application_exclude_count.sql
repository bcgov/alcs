with application_type_lookup AS (
    SELECT
        oaac.alr_application_id AS application_id,
        
        oaac.alr_change_code AS code
        

    FROM
        oats.oats_alr_appl_components AS oaac
       ),
application_rows as (
select count(*) as row_count, SUM(1) as sum_rows
	from application_type_lookup atl
	group by atl.application_id 
	having count(application_id) > 1
)
       
select count(*) as "count"
--SUM(row_count) as total_apps
from application_rows