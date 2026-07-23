insert into
    alcs.user (
        uuid,
        audit_created_by,
        display_name,
        identity_provider,
        preferred_username,
        name,
        client_roles
    )
values (
    %s,
    'nris_etl',
    'NRIS ETL',
    'idir',
    'nris_etl',
    'NRIS ETL',
    '{C&E}'
);