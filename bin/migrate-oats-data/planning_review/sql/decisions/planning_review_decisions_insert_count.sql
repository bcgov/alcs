SELECT
    COUNT(*)
FROM
    oats.oats_planning_decisions opd
    JOIN alcs.planning_review pr ON opd.planning_review_id::TEXT = pr.file_number