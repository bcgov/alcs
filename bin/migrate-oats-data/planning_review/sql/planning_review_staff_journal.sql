SELECT oprn.note_date, oprn.note_text, oprn.revision_count, oprn.planning_review_note_id, pr."uuid" 
FROM oats.oats_planning_review_notes oprn
JOIN alcs.planning_review pr ON pr.file_number = oprn.planning_review_id::TEXT 