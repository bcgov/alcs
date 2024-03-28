SELECT opr.planning_review_id, pr.file_number, pr."uuid"
FROM alcs.planning_review pr 
JOIN oats.oats_planning_reviews opr ON pr.file_number = opr.planning_review_id::TEXT