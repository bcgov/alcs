insert into
    alcs.compliance_and_enforcement (
        audit_created_by,
        file_number,
        date_submitted,
        date_opened,
        initial_submission_type,
        alleged_activity,
        intake_notes,
        assignee_uuid
    )
values %s
on conflict do nothing;