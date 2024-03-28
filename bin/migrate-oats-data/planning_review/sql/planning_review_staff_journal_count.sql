SELECT count (*)
FROM oats.oats_planning_review_notes oprn
JOIN alcs.planning_review pr ON pr.file_number = oprn.planning_review_id::TEXT 