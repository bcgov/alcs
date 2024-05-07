SELECT
    opd.when_created,
    opd.decision_date,
    opd.description,
    opd.planning_acceptance_code,
    pr."uuid",
    opd.resolution_number,
    opd.planning_decision_id,
    pr.file_number
FROM
    oats.oats_planning_decisions opd
    JOIN alcs.planning_review pr ON opd.planning_review_id::TEXT = pr.file_number