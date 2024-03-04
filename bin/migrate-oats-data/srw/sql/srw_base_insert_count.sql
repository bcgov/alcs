SELECT count(*)
From oats.oats_alr_applications AS oa
    JOIN oats.alcs_etl_srw AS ae ON oa.alr_application_id = ae.alr_application_id