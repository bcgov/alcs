SELECT COUNT(*)
FROM alcs.planning_review pr 
JOIN oats.oats_planning_reviews opr ON pr.file_number = opr.planning_review_id::TEXT;