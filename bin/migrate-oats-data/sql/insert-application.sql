-- Step 1: Perform a lookup to retrieve the applicant's name or organization for each application ID
with applicant_lookup as (
    select distinct
    oaap.alr_application_id as application_id,
    string_agg(distinct oo.organization_name, ', ') filter (where oo.organization_name is not null) as orgs,
    string_agg(distinct concat(op.first_name || ' ' || op.last_name), ', ') filter (where op.last_name is not null or op.first_name is not null) as persons
    from oats.oats_alr_application_parties oaap
    left join oats.oats_person_organizations opo on oaap.person_organization_id = opo.person_organization_id
    left join oats.oats_persons op on op.person_id  = opo.person_id 
    left join oats.oats_organizations oo on opo.organization_id = oo.organization_id 
    where oaap.alr_appl_role_code = 'APPL' group by oaap.alr_application_id
),
-- Step 2: Perform a lookup to retrieve the region code for each application ID
panel_lookup as (
    select distinct oaap.alr_application_id as application_id, oo2.organization_name as panel_region
    from oats.oats_alr_application_parties oaap 
    join oats.oats_person_organizations opo on oaap.person_organization_id = opo.person_organization_id
    join oats.oats_organizations oo on opo.organization_id = oo.organization_id 
    join oats.oats_organizations oo2 on oo.parent_organization_id = oo2.organization_id 
    where oo2.organization_type_cd = 'PANEL'
)
-- Step 3: Insert new records into the alcs_applications table
INSERT INTO alcs_applications (file_number, applicant, region_code) 
SELECT 
    oa.alr_application_id::text as file_number,
    case 
        when applicant_lookup.orgs is not null then applicant_lookup.orgs
        else applicant_lookup.persons
    end as applicant,
    panel_lookup.panel_region as panel_region
FROM oats.oats_alr_applications as oa
left join applicant_lookup on oa.alr_application_id = applicant_lookup.application_id
left join panel_lookup on oa.alr_application_id = panel_lookup.application_id
group by lookup_application_id