SELECT
    ops.open_ind,
    ops.planning_review_id,
    ops.planning_review_code,
    ops.legacy_planning_review_nbr,
    sj.author_uuid 
FROM
    oats.oats_planning_reviews ops
    JOIN alcs.planning_review apr ON ops.planning_review_id::TEXT = apr.file_number
    LEFT JOIN alcs.staff_journal sj ON apr."uuid" = sj.planning_review_uuid 
    