SELECT count(*)
FROM oats.oats_soil_change_elements osce
    JOIN oats.oats_alr_appl_components oaac ON oaac.alr_appl_component_id = osce.alr_appl_component_id
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number = oaac.alr_application_id::text