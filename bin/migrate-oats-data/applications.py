from tqdm import tqdm

BATCH_SIZE = 10
SRC_TABLE_NAME = "oats.oats_alr_applications"
MAP_FILES = {"application": "maps/application.yaml"}


def process_applications(conn):

    # Get metadata
    cursor = conn.cursor()
    count_sql = "SELECT COUNT(*) FROM {table}"
    cursor.execute(count_sql.format(table=SRC_TABLE_NAME))
    count = cursor.fetchone()[0]
    print("Number of applications: ", count)

    application_map = load_map(MAP_FILES["application"])
    src_columns = get_src_columns(application_map)

    # Application SQL string
    application_sql = """
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
    panel_lookup as (
        select distinct oaap.alr_application_id as application_id, oo2.organization_name as panel_region
        from oats.oats_alr_application_parties oaap 
        join oats.oats_person_organizations opo on oaap.person_organization_id = opo.person_organization_id
        join oats.oats_organizations oo on opo.organization_id = oo.organization_id 
        join oats.oats_organizations oo2 on oo.parent_organization_id = oo2.organization_id 
        where oo2.organization_type_cd = 'PANEL'
    )
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
    """

    cursor.execute(
        application_sql.format(columns=" ".join(src_columns), table=SRC_TABLE_NAME)
    )

    cursor.close()
    # cur_target.close()
