SELECT
    COUNT(*)
FROM
    alcs.application_submission as2
    JOIN oats.oats_alr_appl_components oaac ON as2.file_number = oaac.alr_application_id::TEXT
WHERE
    oaac.material_need_ind IS NOT NULL;