insert into
    alcs.user (
        bceid_guid,
        email,
        display_name,
        identity_provider,
        preferred_username,
        audit_created_by
    )
values
    (
        %(user_uuid)s,
        'nris-etl@example.com',
        'nris-etl',
        'nris-etl',
        'nris-etl',
        %(creator_uuid)s
    )
on conflict do nothing;
