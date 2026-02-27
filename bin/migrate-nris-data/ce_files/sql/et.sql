select distinct
    'nris_etl' as audit_created_by,
    nc.record_id as file_number,
    nc.date as date_submitted,
    coalesce(nc.complaint_referral_processed_date, nc.date) as date_opened,
    nc.type::alcs.compliance_and_enforcement_initial_submission_type_enum as initial_submission_type,
    (
        select
            array_agg(
                case
                    when activity = 'Residences' then 'Residence'
                    when activity = 'Breach of Conditions' then 'Breach of Condition'
                    when activity = 'Dwellings' then 'Residence'
                    when activity = 'Commercial Activity' then 'Non-Farm Use'
                    else activity
                end
            ) as activity
        from
            (
                select
                    regexp_replace(
                        initcap(
                            trim(
                                both '"'
                                from
                                    activity
                            )
                        ),
                        '\sOf\s',
                        ' of '
                    ) as activity
                from
                    regexp_split_to_table(nc.activity, '\s*,\s*') as nc (activity)
            ) activities
    )::alcs._compliance_and_enforcement_alleged_activity_enum as alleged_activity,
    coalesce(nc.internal_notes || '; ' || nc.description_and_comments, '') as intake_notes,
    au.uuid as assignee_uuid
from
    nris.complaint nc
    left join alcs.user au on lower(au.idir_user_name) = lower(nc.assigned_to);