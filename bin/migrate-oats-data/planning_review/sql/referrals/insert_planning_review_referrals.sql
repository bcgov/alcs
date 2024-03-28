SELECT
    pr."uuid",
    opr.description,
    opr.received_date,
    opr.planning_review_id::TEXT AS file_number,
    ac."uuid" AS card_uuid,
    opr.planning_review_id
FROM
    alcs.planning_review pr
    JOIN oats.oats_planning_reviews opr ON pr.file_number = opr.planning_review_id::TEXT
    JOIN alcs.card ac ON pr."uuid"::TEXT = ac.audit_updated_by