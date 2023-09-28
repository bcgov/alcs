--- Use this query to manually validate that data mapped properly. Execute in DB IDE of your choice
-- validate that remove columns mapped properly
WITH soil_to_remove AS (
    SELECT oaac.alr_application_id,
        osce.soil_change_code,
        osce.material_desc,
        osce.material_origin_desc,
        osce.volume,
        osce.project_area,
        osce."depth"
    FROM oats.oats_soil_change_elements osce
        JOIN oats.oats_alr_appl_components oaac ON oaac.alr_appl_component_id = osce.alr_appl_component_id
        JOIN alcs.notice_of_intent_submission nois ON nois.file_number = oaac.alr_application_id::TEXT
    WHERE osce.soil_change_code = 'REMOVE'
)
SELECT *
FROM soil_to_remove AS soil_to_r
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number = soil_to_r.alr_application_id::TEXT
WHERE (
        soil_to_remove_volume != soil_to_r.volume
        AND soil_to_r.volume != NULL
    )
    OR (
        soil_to_remove_area != soil_to_r.project_area
        AND soil_to_r.project_area != NULL
    )
    OR (
        soil_to_remove_maximum_depth != soil_to_r."depth"
        AND soil_to_r."depth" != NULL
    )
    OR (
        soil_to_remove_average_depth != soil_to_r."depth"
        AND soil_to_r."depth" != NULL
    )
    OR soil_already_removed_volume != 0
    OR soil_already_removed_area != 0
    OR soil_already_removed_maximum_depth != 0
    OR soil_already_removed_average_depth != 0;
-- validate that place columns mapped properly
WITH soil_to_remove AS (
    SELECT oaac.alr_application_id,
        osce.soil_change_code,
        osce.material_desc,
        osce.material_origin_desc,
        osce.volume,
        osce.project_area,
        osce."depth"
    FROM oats.oats_soil_change_elements osce
        JOIN oats.oats_alr_appl_components oaac ON oaac.alr_appl_component_id = osce.alr_appl_component_id
        JOIN alcs.notice_of_intent_submission nois ON nois.file_number = oaac.alr_application_id::TEXT
    WHERE osce.soil_change_code = 'ADD'
)
SELECT *
FROM soil_to_remove AS soil_to_r
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number = soil_to_r.alr_application_id::TEXT
WHERE (
        soil_to_place_area != soil_to_r.volume
        AND soil_to_r.volume != NULL
    )
    OR (
        soil_to_place_area != soil_to_r.project_area
        AND soil_to_r.project_area != NULL
    )
    OR (
        soil_to_place_maximum_depth != soil_to_r."depth"
        AND soil_to_r."depth" != NULL
    )
    OR (
        soil_to_place_average_depth != soil_to_r."depth"
        AND soil_to_r."depth" != NULL
    )
    OR soil_already_placed_volume != 0
    OR soil_already_placed_area != 0
    OR soil_already_placed_maximum_depth != 0
    OR soil_already_placed_average_depth != 0