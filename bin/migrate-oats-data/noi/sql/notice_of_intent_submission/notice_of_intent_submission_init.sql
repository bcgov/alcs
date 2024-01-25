WITH noi_components_grouped AS (
    SELECT *
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code = 'NOI'
        and oaa.alr_change_code <> 'SRW'
)
SELECT noi.file_number,
    noi.type_code,
    noi.local_government_uuid,
    oc.alr_change_code,
    noig.alr_application_id,
    noi.applicant,
    noi.alr_area,
    oc.alr_appl_component_id
FROM noi_components_grouped noig
    LEFT JOIN alcs.notice_of_intent noi ON noi.file_number = noig.alr_application_id::TEXT
    JOIN oats.oats_alr_appl_components oc ON noig.alr_appl_component_id = oc.alr_appl_component_id